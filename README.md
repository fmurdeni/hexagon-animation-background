# Hexagon Animation

An interactive canvas animation featuring hexagons that create beautiful ripple effects across the screen.

## Features

- **Honeycomb Pattern**: Hexagons arranged in a perfect honeycomb grid (100px width, 110px height)
- **Dual Ripple Effects**:
  - Continuous ripple that spreads across the entire page without interruption
  - Interval-based ripples that appear every 1.5 seconds
- **Interactive Hover**: Hexagons respond to mouse hover with faster animations
- **Smooth Animations**: Carefully tuned animation speeds for natural-looking effects
- **Responsive Design**: Adapts to different screen sizes

## Animation Details

### Ripple Behavior
- Continuous ripple uses callbacks to ensure uninterrupted spreading
- Interval-based ripples maintain a minimum distance of 3 hexagons between groups
- Each ripple can have 3-4 waves for wider spread
- Maximum 6 hexagons per wave in each ripple
- Staggered appearance and disappearance for more natural effect

### Animation Speeds
- Slow appearance animation (0.01-0.02 range)
- Slow hide animation (0.01 speed, approximately 1 second transition)
- Faster hover animation show (0.1 for appearance)
- Faster hover animation hide (0.05 for disappearance)

### Hexagon Design
- White borders with transparent fill
- CSS clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
- 4px × 2px margins between hexagons

## Installation

### Prerequisites
- [Laragon](https://laragon.org/) or any other local web server

### Setup Instructions

1. **Clone or download this repository**
   ```
   git clone git@github.com:fmurdeni/hexagon-animation-background.git
   ```
   Or simply download and extract the ZIP file.

2. **Set up with Laragon**
   - Place the project folder in your Laragon's www directory (typically `C:\laragon\www\`)
   - Start Laragon
   - Access the project via `http://hexagon.test` or `http://localhost/hexagon`

3. **Alternative setup with any web server**
   - Place the project files in your web server's document root
   - Access via the appropriate URL for your server configuration

4. **Manual setup (without a web server)**
   - Simply open the `index.html` file in a modern web browser
   - Note: Some browsers may have security restrictions when running local files

## Project Structure

- `index.html` - Main HTML file
- `style.css` - Basic styling for the page
- `script.js` - Full, commented version of the animation code
- `script.min.js` - Minified version for production use

## Browser Compatibility

This animation works best in modern browsers that support HTML5 Canvas and modern JavaScript features:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License

## Author

Feri Murdeni murdeni.com
