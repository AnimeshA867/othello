# Image Assets Guide for Othello Online

## Required Images for SEO

Place all images in the `/public` folder.

### 1. Favicon & Icons

#### favicon.ico

- **Size**: 32x32 pixels (with 16x16 included)
- **Format**: ICO
- **Purpose**: Browser tab icon
- **Tool**: https://favicon.io/favicon-generator/
- **Design**: Letter "O" or small Othello board

#### apple-touch-icon.png

- **Size**: 180x180 pixels
- **Format**: PNG
- **Purpose**: iOS home screen icon
- **Background**: Solid color (black or white)
- **Design**: Same as favicon but larger

#### icon-192.png & icon-512.png

- **Sizes**: 192x192 and 512x512 pixels
- **Format**: PNG with transparency
- **Purpose**: PWA installation icons
- **Design**: App icon with padding

### 2. Open Graph Images

#### og-image.png

- **Size**: 1200x630 pixels
- **Format**: PNG or JPG
- **Purpose**: Social media sharing (Facebook, LinkedIn, Twitter)
- **Content**:
  - Othello board image (8x8 grid with black/white pieces)
  - Title: "Othello Online"
  - Tagline: "Play Free Classic Strategy Game"
  - Your domain name
- **Colors**: High contrast, readable text
- **Tool**: Canva (template: Facebook Post 1200x630)

#### how-to-play-og.png

- **Size**: 1200x630 pixels
- **Format**: PNG or JPG
- **Purpose**: Sharing the how-to-play page
- **Content**:
  - Game board diagram
  - Title: "How to Play Othello"
  - Step-by-step visual or rules summary
- **Tool**: Canva or Figma

### 3. PWA Assets

#### screenshot-1.png

- **Size**: 1280x720 pixels
- **Format**: PNG or JPG
- **Purpose**: PWA installation preview
- **Content**: Actual gameplay screenshot showing the board

#### logo.png

- **Size**: 512x512 pixels (square)
- **Format**: PNG with transparency
- **Purpose**: Schema.org organization logo
- **Design**: App icon or letter "O"

## Quick Generation Guide

### Option 1: Using Favicon.io (Easiest)

1. Go to https://favicon.io/favicon-generator/
2. Settings:
   - Text: "O"
   - Font: Inter or Roboto Bold
   - Background: Black (#000000)
   - Font Color: White (#FFFFFF)
   - Size: 64
3. Download and extract
4. Rename files:
   - `favicon.ico` → `/public/favicon.ico`
   - `android-chrome-192x192.png` → `/public/icon-192.png`
   - `android-chrome-512x512.png` → `/public/icon-512.png`
   - `apple-touch-icon.png` → `/public/apple-touch-icon.png`

### Option 2: Using Canva (Best Quality)

1. **For Icons**:

   - Create 512x512 design
   - Add circle background (black)
   - Add white "O" or miniature board (8x8 grid)
   - Export as PNG
   - Resize for different sizes using: https://www.iloveimg.com/resize-image

2. **For OG Images**:
   - Use "Facebook Post" template (1200x630)
   - Add game board image/screenshot
   - Add text overlay:
     - Main: "Othello Online" (72pt, bold)
     - Sub: "Free Strategy Board Game" (36pt)
     - Footer: Your domain (24pt)
   - Export as PNG (high quality)

### Option 3: Using Figma (Professional)

Download our template:

```
(Create a Figma file with frames for each size)
- Frame 1: 512x512 (App Icon)
- Frame 2: 1200x630 (OG Image)
- Frame 3: 1280x720 (Screenshot)
```

## Design Recommendations

### Color Palette

- **Primary**: Black (#000000)
- **Secondary**: White (#FFFFFF)
- **Accent**: Green (#22C55E) or Blue (#3B82F6)
- **Board**: Dark green or wooden texture

### Typography

- **Headings**: Inter, Roboto, or Geist (bold)
- **Body**: Same as headings (regular weight)
- **Size Guidelines**:
  - OG Image Title: 60-72pt
  - OG Image Subtitle: 32-36pt
  - Domain/URL: 20-24pt

### Image Style

- High contrast for readability
- Clean, modern design
- Consistent branding across all images
- No text smaller than 24pt on OG images
- Keep important content in safe zones (avoid edges)

## Temporary Placeholder

If you need to launch immediately without custom images, you can:

1. Use text-based favicon from Favicon.io (5 minutes)
2. Use a screenshot of your game as OG image
3. Generate basic icons with online tools

## Verification Checklist

Before deployment, verify:

- [ ] `favicon.ico` appears in browser tab
- [ ] Icons load on iOS (test with Safari)
- [ ] OG image shows correctly when sharing on:
  - [ ] Facebook: https://developers.facebook.com/tools/debug/
  - [ ] Twitter: https://cards-dev.twitter.com/validator
  - [ ] LinkedIn: https://www.linkedin.com/post-inspector/
- [ ] PWA icons display correctly when installing
- [ ] All images are optimized (< 500KB each)

## Tools & Resources

### Image Creation

- **Canva**: https://www.canva.com/ (Free tier sufficient)
- **Figma**: https://www.figma.com/ (Free)
- **Photopea**: https://www.photopea.com/ (Free Photoshop alternative)

### Icon Generators

- **Favicon.io**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/

### Image Optimization

- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/ (Mac)

### Testing Tools

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
- **OpenGraph.xyz**: https://www.opengraph.xyz/

## Priority Order

If short on time, create in this order:

1. **favicon.ico** (5 min) - Most visible
2. **og-image.png** (15 min) - Social sharing
3. **icon-192.png & icon-512.png** (5 min) - PWA
4. **apple-touch-icon.png** (5 min) - iOS
5. **Other images** - Can add later

## Notes

- All icons should be square (1:1 ratio)
- OG images should be 1.91:1 ratio (1200x630)
- Use PNG for transparency, JPG for photos
- Optimize all images before uploading
- Test on multiple devices and platforms

---

**Need help?** Use AI image generators:

- DALL-E, Midjourney, or Stable Diffusion
- Prompt: "minimalist black and white othello board game icon, simple geometric design, professional app icon"
