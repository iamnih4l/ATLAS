import os
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

def generate():
    os.makedirs('atlas-app/public/textures', exist_ok=True)

    # 1. Load real NASA image and specular mask
    real_img = Image.open('atlas-app/public/textures/earth_real.jpg').convert('RGB')
    spec_img = Image.open('atlas-app/public/textures/earth_specular.jpg').convert('L')

    W, H = real_img.size
    print(f'Processing real Earth image: {W}x{H}')

    real_arr = np.array(real_img, dtype=np.float32)
    spec_arr = np.array(spec_img)

    # Binary land/water mask: Water is spec > 5, Land is spec <= 5
    is_water = spec_arr > 5
    is_land = ~is_water

    # Morphological dilation for coastal turquoise shelf
    land_mask_img = Image.fromarray((is_land * 255).astype(np.uint8))
    shelf_mask_img = land_mask_img.filter(ImageFilter.MaxFilter(9))
    shelf_arr = np.array(shelf_mask_img) > 128
    is_coastal_shelf = shelf_arr & is_water

    # Inner eroded land for beach detection
    eroded_land_img = land_mask_img.filter(ImageFilter.MinFilter(3))
    eroded_arr = np.array(eroded_land_img) > 128
    is_beach = is_land & (~eroded_arr)

    # Detect biomes from real NASA colors
    r = real_arr[:, :, 0]
    g = real_arr[:, :, 1]
    b = real_arr[:, :, 2]
    brightness = (r + g + b) / 3.0

    # Latitude grid (-90 to +90)
    lats = np.linspace(90, -90, H)[:, None]

    # Polar ice: Greenland, Antarctica, extreme northern Siberia/Canada, or high brightness on land
    is_polar = is_land & ((lats > 70) | (lats < -60) | ((brightness > 175) & (r > 160) & (b > 155)))

    # Mountain ranges: high contrast, rock slate
    sat = np.max(real_arr, axis=2) - np.min(real_arr, axis=2)
    is_mountain = is_land & (~is_polar) & (sat < 35) & (brightness > 60) & (brightness < 160)

    # Desert / Arid: warm hue (Sahara, Arabia, Gobi, Outback, Atacama)
    is_desert = is_land & (~is_polar) & (~is_mountain) & (r > g * 1.05) & (r > b * 1.35) & (brightness > 85)

    # Dense rainforest: green strongly dominant, lower brightness
    is_rainforest = is_land & (~is_polar) & (~is_mountain) & (~is_desert) & (g > r * 1.1) & (brightness < 110)

    # Standard lush gamer plains
    is_plains = is_land & (~is_polar) & (~is_mountain) & (~is_desert) & (~is_rainforest)

    print(f'Land breakdown: Polar={np.sum(is_polar)}, Desert={np.sum(is_desert)}, Plains={np.sum(is_plains)}, Rainforest={np.sum(is_rainforest)}, Mountain={np.sum(is_mountain)}')

    # ========================================================
    # 1. CREATE GRAPHIC POP ART TEXTURE (2048x1024)
    # ========================================================
    pop_arr = np.zeros((H, W, 3), dtype=np.uint8)

    # Base Ocean: Vibrant Cobalt Blue #2563EB (37, 99, 235)
    pop_arr[is_water] = [37, 99, 235]

    # Deep water trench
    deep_water = is_water & (b < 60)
    pop_arr[deep_water] = [29, 78, 216] # #1d4ed8

    # Turquoise Coastal Shelves: #06b6d4 (6, 182, 212)
    pop_arr[is_coastal_shelf] = [6, 182, 212]

    # Sandy Beaches: #fef08a (254, 240, 138)
    pop_arr[is_beach] = [254, 240, 138]

    # Continents Biomes
    pop_arr[is_plains] = [34, 197, 94]      # Vibrant Gamer Green #22c55e
    pop_arr[is_rainforest] = [21, 128, 61]   # Dark Emerald Rainforest #15803d
    pop_arr[is_desert] = [250, 204, 21]      # Sunflower Pop Yellow #facc15
    pop_arr[is_mountain] = [100, 116, 139]   # Slate Gray #64748b
    pop_arr[is_polar] = [248, 250, 252]      # Pure Snow White #f8fafc

    # Snowy mountain peaks
    is_snow_peaks = is_mountain & (brightness > 130)
    pop_arr[is_snow_peaks] = [255, 255, 255]

    # Outline Landmasses with Ink Black (#171313)
    coastline_edges = land_mask_img.filter(ImageFilter.FIND_EDGES)
    coast_arr = np.array(coastline_edges) > 50
    pop_arr[coast_arr] = [23, 19, 19]

    pop_img = Image.fromarray(pop_arr)

    pop_img.save('atlas-app/public/textures/earth_gamified_pop.png')
    print('Successfully generated: atlas-app/public/textures/earth_gamified_pop.png')

    # ========================================================
    # 2. CREATE 16-BIT RETRO PIXEL ART TEXTURE (1024x512)
    # ========================================================
    pixel_w, pixel_h = 1024, 512
    # Apply 4x4 Bayer ordered dithering
    pixel_canvas = pop_img.resize((pixel_w, pixel_h), Image.Resampling.BILINEAR)
    pixel_arr = np.array(pixel_canvas, dtype=np.float32)

    bayer4x4 = np.array([
        [ 0,  8,  2, 10],
        [12,  4, 14,  6],
        [ 3, 11,  1,  9],
        [15,  7, 13,  5]
    ], dtype=np.float32)

    dither_matrix = np.tile((bayer4x4 - 7.5) * 3.5, (pixel_h // 4, pixel_w // 4))[:, :, None]
    pixel_dithered = np.clip(pixel_arr + dither_matrix, 0, 255).astype(np.uint8)

    # Quantize to 16-color retro palette
    palette = [
        [30, 58, 138],   # 0: Deep Ocean (#1e3a8a)
        [37, 99, 235],   # 1: Royal Blue (#2563eb)
        [6, 182, 212],   # 2: Coastal Turquoise (#06b6d4)
        [254, 240, 138], # 3: Sand Beach (#fef08a)
        [250, 204, 21],  # 4: Desert Gold (#facc15)
        [202, 138, 4],   # 5: Desert Shadow (#ca8a04)
        [34, 197, 94],   # 6: Gamer Green (#22c55e)
        [22, 163, 74],   # 7: Dense Forest (#16a34a)
        [21, 128, 61],   # 8: Rainforest (#15803d)
        [100, 116, 139], # 9: Mountain Slate (#64748b)
        [51, 65, 85],    # 10: Dark Mountain Rock (#334155)
        [248, 250, 252], # 11: Snow / Ice (#f8fafc)
        [255, 212, 90],  # 12: Nautical Gold (#ffd45a)
        [23, 19, 19],    # 13: Ink Black (#171313)
        [240, 68, 50],   # 14: Pop Red (#f04432)
        [100, 37, 245],  # 15: Electric Purple (#6425f5)
    ]
    pal_arr = np.array(palette, dtype=np.float32)

    flat_pixels = pixel_dithered.reshape(-1, 3).astype(np.float32)
    # Find nearest palette color for each pixel in batches
    batch_size = 65536
    quantized_indices = np.zeros(flat_pixels.shape[0], dtype=np.int32)
    for i in range(0, flat_pixels.shape[0], batch_size):
        batch = flat_pixels[i:i+batch_size]
        dists = np.sum((batch[:, None, :] - pal_arr[None, :, :]) ** 2, axis=2)
        quantized_indices[i:i+batch_size] = np.argmin(dists, axis=1)

    quantized_arr = pal_arr[quantized_indices].reshape(pixel_h, pixel_w, 3).astype(np.uint8)
    pixel_img = Image.fromarray(quantized_arr)
    pixel_img.save('atlas-app/public/textures/earth_gamified_pixel.png')
    print('Successfully generated: atlas-app/public/textures/earth_gamified_pixel.png')

    # ========================================================
    # 3. CREATE GAMIFIED CARTOON CLOUDS TEXTURE (1024x512)
    # ========================================================
    # Use RGBA alpha channel directly to avoid palette conversion distortion
    cloud_orig = Image.open('atlas-app/public/textures/earth_clouds.png').convert('RGBA')
    cloud_w, cloud_h = 1024, 512
    cloud_resized = cloud_orig.resize((cloud_w, cloud_h), Image.Resampling.BILINEAR)
    cloud_arr = np.array(cloud_resized)
    cloud_alpha = cloud_arr[:, :, 3]

    # Greatly reduce cloud coverage so continents and oceans remain 86%+ clear
    is_dense_cloud = cloud_alpha > 95
    is_wispy_cloud = (cloud_alpha > 65) & (~is_dense_cloud)

    cloud_rgba = np.zeros((cloud_h, cloud_w, 4), dtype=np.uint8)
    # Dense cartoon puffs: soft warm cream-white
    cloud_rgba[is_dense_cloud] = [255, 255, 255, 175]
    # Subtle wispy cloud fringe
    cloud_rgba[is_wispy_cloud] = [255, 255, 255, 75]

    cloud_rgba_img = Image.fromarray(cloud_rgba)
    # Soften edges into cute cartoon cloud puffs
    cloud_rgba_img = cloud_rgba_img.filter(ImageFilter.GaussianBlur(radius=1.2))
    cloud_rgba_img.save('atlas-app/public/textures/earth_clouds_gamified.png')
    print('Successfully generated: atlas-app/public/textures/earth_clouds_gamified.png')

if __name__ == '__main__':
    generate()

