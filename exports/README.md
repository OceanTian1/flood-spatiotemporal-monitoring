# Exports

This folder contains the main data products exported from Google Earth Engine.

## Files

### `sentinel1_flood_extent_2021.tif`

GeoTIFF containing the final flood-candidate mask.

The raster represents pixels retained after backscatter-threshold filtering, pre-flood water screening, permanent-water removal and connected-pixel filtering.

### `sentinel1_difference_db_2021.tif`

GeoTIFF containing the difference between the pre-flood and flood-period VV median composites:

`pre-flood VV - flood-period VV`

Values are expressed in decibels.

### `flood_area_summary_2021.csv`

CSV summary containing the main analysis parameters and calculated flood-candidate area.

The final detected area is approximately:

- 3,269,872 m²
- 326.99 ha
- 3.2699 km²

## Notes

These files are derived analysis products.

Raw Sentinel-1 and JRC datasets are not redistributed in this repository because they were accessed directly through Google Earth Engine.

The exported flood extent represents potential inundation and has not been independently validated against a reference flood dataset.
