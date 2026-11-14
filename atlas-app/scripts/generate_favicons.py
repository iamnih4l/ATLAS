import os
from PIL import Image, ImageDraw

def render_atlas_icon(size_px=512):
    img = Image.new('RGBA', (size_px, size_px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    scale = size_px / 512.0

    # Center of globe
    cx = int(248 * scale)
    cy = int(262 * scale)
    r = int(182 * scale)

    # 1. Signature Bento Drop Shadow
    s_dx = int(14 * scale)
    s_dy = int(16 * scale)
    draw.ellipse([cx - r + s_dx, cy - r + s_dy, cx + r + s_dx, cy + r + s_dy], fill=(23, 19, 19, 255))

    # 2. Globe Sphere (Warm Cream)
    b_width = max(2, int(22 * scale))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 244, 217, 255), outline=(23, 19, 19, 255), width=b_width)

    # 3. Coordinate Meridians (Equator & Longitude)
    m_width = max(1, int(14 * scale))
    draw.line([cx - r + int(10*scale), cy, cx + r - int(10*scale), cy], fill=(230, 211, 163, 255), width=m_width)
    rx = int(88 * scale)
    draw.ellipse([cx - rx, cy - r + int(6*scale), cx + rx, cy + r - int(6*scale)], outline=(230, 211, 163, 255), width=m_width)

    # 4. Continents
    cont_w = max(2, int(14 * scale))
    
    # North-West Continent (Emerald)
    c1_pts = [
        (int(145*scale), int(195*scale)),
        (int(185*scale), int(150*scale)),
        (int(240*scale), int(185*scale)),
        (int(225*scale), int(235*scale)),
        (int(165*scale), int(240*scale))
    ]
    draw.polygon(c1_pts, fill=(16, 185, 129, 255), outline=(23, 19, 19, 255))

    # South-East Continent (Emerald)
    c2_pts = [
        (int(270*scale), int(280*scale)),
        (int(330*scale), int(260*scale)),
        (int(355*scale), int(310*scale)),
        (int(320*scale), int(365*scale)),
        (int(265*scale), int(340*scale))
    ]
    draw.polygon(c2_pts, fill=(16, 185, 129, 255), outline=(23, 19, 19, 255))

    # Golden Archipelago Island
    i_r = int(18 * scale)
    ix = int(340 * scale)
    iy = int(195 * scale)
    draw.ellipse([ix - i_r, iy - i_r, ix + i_r, iy + i_r], fill=(245, 158, 11, 255), outline=(23, 19, 19, 255), width=max(2, int(10*scale)))

    # 5. Explorer Sparkle Star (Top Left)
    sx = int(105 * scale)
    sy = int(105 * scale)
    s_arm = int(32 * scale)
    s_in = int(10 * scale)
    star_pts = [
        (sx, sy - s_arm),
        (sx + s_in, sy - s_in),
        (sx + s_arm, sy),
        (sx + s_in, sy + s_in),
        (sx, sy + s_arm),
        (sx - s_in, sy + s_in),
        (sx - s_arm, sy),
        (sx - s_in, sy - s_in)
    ]
    draw.polygon(star_pts, fill=(245, 158, 11, 255), outline=(23, 19, 19, 255))

    # 6. Landmark Pin (Vibrant Coral Red with White Eye)
    pin_tip_x = int(282 * scale)
    pin_tip_y = int(178 * scale)

    # Pin ground shadow
    ps_rx = int(16 * scale)
    ps_ry = int(6 * scale)
    draw.ellipse([pin_tip_x - ps_rx, pin_tip_y - ps_ry, pin_tip_x + ps_rx, pin_tip_y + ps_ry], fill=(23, 19, 19, 90))

    # Pin triangle body
    t_w = int(28 * scale)
    t_h = int(62 * scale)
    draw.polygon([
        (pin_tip_x, pin_tip_y),
        (pin_tip_x - t_w, pin_tip_y - t_h),
        (pin_tip_x + t_w, pin_tip_y - t_h)
    ], fill=(239, 68, 68, 255), outline=(23, 19, 19, 255))

    # Pin round head
    head_cy = pin_tip_y - t_h
    head_r = int(35 * scale)
    pin_border = max(2, int(16 * scale))
    draw.ellipse([pin_tip_x - head_r, head_cy - head_r, pin_tip_x + head_r, head_cy + head_r],
                 fill=(239, 68, 68, 255), outline=(23, 19, 19, 255), width=pin_border)

    # Pin White Inner Eye
    eye_r = int(12 * scale)
    eye_border = max(1, int(8 * scale))
    draw.ellipse([pin_tip_x - eye_r, head_cy - eye_r, pin_tip_x + eye_r, head_cy + eye_r],
                 fill=(255, 255, 255, 255), outline=(23, 19, 19, 255), width=eye_border)

    return img

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    app_dir = os.path.join(base_dir, 'src', 'app')
    public_dir = os.path.join(base_dir, 'public')

    # Render master 512x512 icon
    master_512 = render_atlas_icon(512)

    # 1. Multi-resolution favicon.ico (16, 32, 48)
    img_16 = master_512.resize((16, 16), Image.Resampling.LANCZOS)
    img_32 = master_512.resize((32, 32), Image.Resampling.LANCZOS)
    img_48 = master_512.resize((48, 48), Image.Resampling.LANCZOS)

    ico_app_path = os.path.join(app_dir, 'favicon.ico')
    ico_pub_path = os.path.join(public_dir, 'favicon.ico')

    img_48.save(ico_app_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    img_48.save(ico_pub_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated multi-size ICO: {ico_app_path}")

    # 2. Apple Touch Icon (180x180 PNG)
    apple_icon = master_512.resize((180, 180), Image.Resampling.LANCZOS)
    apple_app_path = os.path.join(app_dir, 'apple-icon.png')
    apple_pub_path = os.path.join(public_dir, 'apple-touch-icon.png')
    apple_icon.save(apple_app_path, format='PNG')
    apple_icon.save(apple_pub_path, format='PNG')
    print(f"Generated Apple Icon: {apple_app_path}")

    # 3. Master 512x512 PNG for PWA / manifest
    pwa_512_path = os.path.join(public_dir, 'icon-512.png')
    master_512.save(pwa_512_path, format='PNG')
    print(f"Generated 512px icon: {pwa_512_path}")

if __name__ == '__main__':
    main()
