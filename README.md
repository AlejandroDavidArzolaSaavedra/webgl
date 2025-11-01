# 🎮 WebGL Games Gallery

A collection of interactive WebGL games and demos showcasing 3D graphics programming.

## 📋 Overview

This repository contains various WebGL games and demonstrations, each highlighting different aspects of WebGL graphics programming and 3D rendering techniques.

## 🎯 Available Games

### 1. Rotating Cube
A 3D rotating cube with colorful faces demonstrating:
- Basic WebGL transformations
- 3D perspective projection
- Depth testing
- Color interpolation

### 2. Triangle Demo
A simple triangle demo showcasing:
- WebGL rendering basics
- Color gradients
- Vertex and fragment shaders

## 🚀 Getting Started

### Prerequisites
- A modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/AlejandroDavidArzolaSaavedra/webgl.git
cd webgl
```

2. Open `index.html` in your web browser, or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server package)
npx http-server

# Then navigate to http://localhost:8000
```

3. Browse the games gallery and click on any game to play!

## 📁 Project Structure

```
webgl/
├── index.html              # Main gallery page
├── common/                 # Shared resources
│   ├── css/
│   │   └── style.css      # Styling for the gallery
│   └── js/
│       └── webgl-utils.js # WebGL utility functions
├── games/                  # Individual games
│   ├── cube-rotating/
│   │   ├── index.html
│   │   └── cube.js
│   └── triangle-demo/
│       ├── index.html
│       └── triangle.js
└── README.md
```

## 🛠️ Technology Stack

- **WebGL**: For 3D graphics rendering
- **JavaScript**: For game logic and interactions
- **HTML5**: For structure
- **CSS3**: For styling and animations

## 🎨 Features

- Modern, responsive UI design
- Clean and modular code structure
- Reusable WebGL utility functions
- Multiple demo games and graphics examples
- Easy to extend with new games

## 📚 Learning Resources

- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)
- [The Book of Shaders](https://thebookofshaders.com/)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Add your WebGL game or demo
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Alejandro David Arzola Saavedra**

- GitHub: [@AlejandroDavidArzolaSaavedra](https://github.com/AlejandroDavidArzolaSaavedra)

## 🌟 Acknowledgments

- WebGL community for excellent documentation
- Contributors and game developers
