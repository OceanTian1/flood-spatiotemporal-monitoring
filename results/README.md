# Results

This folder contains the main visual results produced by the Sentinel-1 flood-monitoring workflow.

## Files

### `pre_flood_vv.png`

Sentinel-1 VV median composite for the pre-flood period from 1 June 2021 to 1 July 2021.

This image represents the baseline radar backscatter conditions before the event-period window.

### `flood_period_vv.png`

Sentinel-1 VV median composite for the flood-period window from 2 July 2021 to 1 August 2021.

This image is compared with the pre-flood composite to identify changes in radar backscatter.

### `backscatter_difference.png`

Difference between the pre-flood and flood-period VV composites:

`pre-flood VV - flood-period VV`

Larger positive values represent a stronger decrease in VV backscatter during the flood-period window.

### `detected_flood_extent.png`

Final flood-candidate mask after applying:

- backscatter decrease > 2 dB;
- flood-period VV < -16 dB;
- pre-flood VV >= -16 dB;
- permanent-water removal;
- connected-pixel filtering.

The final detected candidate area is approximately 3.27 km².

## Interpretation

The figures show the progression from the original SAR composites to backscatter change and final potential inundation mapping.

The detected extent should be interpreted as an algorithm-derived flood candidate area rather than a validated map of true flood extent.
