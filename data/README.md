# Data

Raw satellite imagery is not stored in this repository.

The datasets used in this project were accessed directly through Google Earth Engine.

## Sentinel-1 SAR

Dataset:

`COPERNICUS/S1_GRD`

Configuration:

- Instrument mode: IW
- Polarisation: VV
- Orbit direction: Descending
- Relative orbit: 105

Pre-flood period:

`2021-06-01` to `2021-07-01`

Flood-period window:

`2021-07-02` to `2021-08-01`

After restricting the image collections to relative orbit 105, two Sentinel-1 acquisitions were retained for the pre-flood period and two for the flood-period window.

## Permanent Water

Dataset:

`JRC/GSW1_4/GlobalSurfaceWater`

The `occurrence` band was used to identify persistent surface water.

Pixels with water occurrence greater than or equal to 90% were treated as permanent water and excluded from the flood-candidate mask.

## Study Area

Approximate study-area extent:

- West: 127.12984°E
- East: 127.18786°E
- South: 45.99357°N
- North: 46.01813°N

The study area is located along the Songhua River in northeastern China.

## Notes

Raw Sentinel-1 and JRC datasets are not redistributed in this repository. The analysis can be reproduced by running `flood_detection.js` in Google Earth Engine.
