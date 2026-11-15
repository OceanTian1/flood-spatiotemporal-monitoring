var geometry = ee.Geometry.Polygon([
  [
    [127.12984281959814, 46.018129664396746],
    [127.12984281959814, 45.99356758316442],
    [127.1878643650083, 45.99356758316442],
    [127.1878643650083, 46.018129664396746]
  ]
]);

var data = geometry;

var preFloodStart = '2021-06-01';
var preFloodEnd = '2021-07-01';

var floodStart = '2021-07-02';
var floodEnd = '2021-08-01';

var orbitPass = 'DESCENDING';
var relativeOrbit = 105;

var diffThreshold_dB = 2.0;
var absolute_dB = -16.0;

var smoothingRadius = 50;
var permanentWaterOccurrence = 90;

var s1_pre = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(data)
  .filterDate(preFloodStart, preFloodEnd)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', orbitPass))
  .filter(ee.Filter.eq('relativeOrbitNumber_start', relativeOrbit))
  .filter(
    ee.Filter.listContains(
      'transmitterReceiverPolarisation',
      'VV'
    )
  )
  .select('VV');

var s1_flood = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(data)
  .filterDate(floodStart, floodEnd)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', orbitPass))
  .filter(ee.Filter.eq('relativeOrbitNumber_start', relativeOrbit))
  .filter(
    ee.Filter.listContains(
      'transmitterReceiverPolarisation',
      'VV'
    )
  )
  .select('VV');

print('Number of pre-flood images:', s1_pre.size());
print('Number of flood-period images:', s1_flood.size());

print(
  'Pre-flood image IDs:',
  s1_pre.aggregate_array('system:index')
);

print(
  'Pre-flood relative orbits:',
  s1_pre.aggregate_array('relativeOrbitNumber_start')
);

print(
  'Flood-period image IDs:',
  s1_flood.aggregate_array('system:index')
);

print(
  'Flood-period relative orbits:',
  s1_flood.aggregate_array('relativeOrbitNumber_start')
);

var pre_median_db = s1_pre
  .median()
  .rename('pre_dB')
  .clip(data);

var flood_median_db = s1_flood
  .median()
  .rename('flood_dB')
  .clip(data);

function speckleReduce(img) {
  return img.focalMedian(
    smoothingRadius,
    'circle',
    'meters',
    1
  );
}

pre_median_db = speckleReduce(pre_median_db);
flood_median_db = speckleReduce(flood_median_db);

var diff_dB = pre_median_db
  .subtract(flood_median_db)
  .rename('diff_dB');

var water_c1 = diff_dB.gt(diffThreshold_dB);

var water_c2 = flood_median_db.lt(absolute_dB);

var notWaterBefore = pre_median_db.gte(absolute_dB);

var flood_candidate = water_c1
  .and(water_c2)
  .and(notWaterBefore);

var gsw = ee.Image(
  'JRC/GSW1_4/GlobalSurfaceWater'
);

var occurrence = gsw
  .select('occurrence')
  .unmask(0);

var permanentWaterMask = occurrence.gte(
  permanentWaterOccurrence
);

var flood_mask = flood_candidate
  .and(permanentWaterMask.not())
  .rename('flood')
  .selfMask();

var connectedPixels = flood_mask
  .connectedPixelCount(
    100,
    true
  );

var flood_clean = flood_mask
  .updateMask(
    connectedPixels.gte(8)
  );

var pixelArea = ee.Image.pixelArea();

var floodAreaImage = pixelArea
  .updateMask(flood_clean);

var areaStats = floodAreaImage
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: data,
    scale: 10,
    maxPixels: 1e13,
    tileScale: 4
  });

var flood_area_m2 = ee.Number(
  areaStats.get('area')
);

var flood_area_ha = flood_area_m2
  .divide(10000);

var flood_area_km2 = flood_area_m2
  .divide(1e6);

print('Flood area (m²):', flood_area_m2);
print('Flood area (ha):', flood_area_ha);
print('Flood area (km²):', flood_area_km2);

Map.centerObject(data, 9);

Map.addLayer(
  pre_median_db,
  {
    min: -25,
    max: 0
  },
  '1. Pre-flood VV',
  false
);

Map.addLayer(
  flood_median_db,
  {
    min: -25,
    max: 0
  },
  '2. Flood-period VV',
  false
);

Map.addLayer(
  diff_dB,
  {
    min: 0,
    max: 8,
    palette: [
      'ffffff',
      'ffff00',
      'ff8800',
      'ff0000'
    ]
  },
  '3. Backscatter difference',
  false
);

Map.addLayer(
  permanentWaterMask
    .selfMask()
    .clip(data),
  {
    palette: ['0000ff']
  },
  '4. Permanent water',
  false
);

Map.addLayer(
  flood_clean,
  {
    palette: ['00ffff']
  },
  '5. Detected flood',
  true
);

Export.image.toDrive({
  image: flood_clean.toByte(),
  description: 'Sentinel1_Flood_Extent_Final_Orbit105',
  folder: 'GEE_Flood_Exports',
  fileNamePrefix: 'sentinel1_flood_extent_final_orbit105_clean',
  region: data,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: diff_dB,
  description: 'Sentinel1_Backscatter_Difference_Orbit105',
  folder: 'GEE_Flood_Exports',
  fileNamePrefix: 'sentinel1_backscatter_difference_orbit105',
  region: data,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

var areaSummary = ee.FeatureCollection([
  ee.Feature(
    null,
    {
      pre_flood_start: preFloodStart,
      pre_flood_end: preFloodEnd,
      flood_start: floodStart,
      flood_end: floodEnd,
      orbit_direction: orbitPass,
      relative_orbit: relativeOrbit,
      difference_threshold_dB: diffThreshold_dB,
      absolute_VV_threshold_dB: absolute_dB,
      minimum_connected_pixels: 8,
      flood_area_m2: flood_area_m2,
      flood_area_ha: flood_area_ha,
      flood_area_km2: flood_area_km2
    }
  )
]);

Export.table.toDrive({
  collection: areaSummary,
  description: 'Flood_Area_Summary_Final',
  folder: 'GEE_Flood_Exports',
  fileNamePrefix: 'flood_area_summary_final',
  fileFormat: 'CSV'
});
