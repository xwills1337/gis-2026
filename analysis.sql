INSTALL spatial; LOAD spatial;
INSTALL httpfs; LOAD httpfs;

SET s3_region = 'us-west-2';

CREATE TABLE user_buildings AS
SELECT * FROM ST_Read('lab1.geojson');

CREATE TABLE overture_buildings AS
SELECT
    id,
    sources[1].dataset AS source_dataset,
    geometry
FROM read_parquet(
    's3://overturemaps-us-west-2/release/2024-08-20.0/theme=buildings/type=building/*',
    hive_partitioning = 1
)
WHERE bbox.xmin BETWEEN 49.28 AND 49.31
  AND bbox.ymin BETWEEN 53.58 AND 53.61;

ALTER TABLE overture_buildings ADD COLUMN source_type VARCHAR;

UPDATE overture_buildings
SET source_type = CASE
    WHEN EXISTS (
        SELECT 1 FROM user_buildings u
        WHERE ST_Intersects(overture_buildings.geometry, u.geom)
    ) THEN 'my'
    WHEN source_dataset ILIKE '%OpenStreetMap%' THEN 'osm'
    ELSE 'ml'
END;

COPY (
    SELECT
        CASE
            WHEN source_type = 'my' THEN geometry
            ELSE ST_FlipCoordinates(geometry)
        END AS geometry,
        source_type
    FROM overture_buildings
) TO 'client/public/overture.geojson'
WITH (FORMAT GDAL, DRIVER 'GeoJSON', SRS 'EPSG:4326');