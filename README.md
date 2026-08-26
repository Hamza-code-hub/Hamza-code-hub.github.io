<div align="center">

# Muhammad Hamza - AI Engineering Portfolio

### LLM & RAG Engineer | Agentic AI Developer | Machine Learning Researcher

A modern, responsive portfolio presenting production-oriented AI systems,
research, engineering services, technical case studies, and professional experience.

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Visit-5B5BD6?style=for-the-badge)](https://hamza-code-hub.github.io/)
[![GitHub](https://img.shields.io/badge/GitHub-Hamza--code--hub-181717?style=for-the-badge&logo=github)](https://github.com/Hamza-code-hub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-hamzzaz-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/hamzzaz)
[![Resume](https://img.shields.io/badge/Resume-Download_PDF-DC2626?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](./resume/Muhammad-Hamza-Resume.pdf)

</div>

---

## Overview

This repository contains the source for my GitHub Pages portfolio. It is designed as a senior AI engineering showcase rather than a conventional template-based personal website.

The portfolio focuses on:

- LLM applications and Retrieval-Augmented Generation
- Agentic AI and multi-agent workflows
- Machine learning and deep learning
- Computer vision and real-time analytics
- Medical imaging research
- Python, Django, FastAPI, and AI-ready backends
- Data pipelines, automation, and production delivery

## Design and interaction

The interface includes a shared professional design system across the homepage, portfolio, services, resume, contact, and project case-study pages.

- Persistent light and dark themes
- System theme detection with saved user preference
- Responsive layouts for desktop, tablet, and mobile
- Stable typed hero specialties with no layout shift
- Scroll progress and staggered reveal animations
- Pointer-aware card lighting and subtle 3D tilt
- Reduced-motion accessibility support
- Animated AI system visualizations built with HTML and CSS
- Animated architecture flows on project detail pages
- Interactive AI architecture map with orbital core, live subsystem consoles, data routes, counters, and cursor parallax
- Consistent spacing, typography, contrast, and card geometry
- Six equal-height homepage service cards and three selected project case studies
- Unique portfolio case studies with a half-animation, half-description card layout
- A restrained two-sheet resume layout with professional A4 print styling

The animated project panels and architecture map are original visual representations of each system. They do not depend on copied project artwork or external animation assets.

## Selected projects

The homepage presents three representative systems:

| Project | Focus | Core technologies |
| --- | --- | --- |
| [VisionGuard](./projects/visionguard-ai.html) | Warehouse collision-risk intelligence | YOLO, ByteTrack, OpenCV |
| [NeuroInsight AI](./projects/neuroinsight-ai.html) | Clinical intelligence and neuroimaging | Agentic AI, RAG, Flutter |
| [Flood Prediction](./projects/flood-prediction-lightgbm.html) | Environmental regression pipeline | LightGBM, Python, Kaggle |

The complete [portfolio page](./portfolio.html) includes additional work in RAG, cybersecurity, satellite imagery, predictive maintenance, automation, and research.

## Website pages

| Page | Purpose |
| --- | --- |
| [Home](./index.html) | Professional introduction, capabilities, research, services, and selected work |
| [Portfolio](./portfolio.html) | Filterable collection of projects and case studies |
| [Services](./services.html) | AI engineering services, delivery approach, and engagement process |
| [Resume](./resume/) | Experience, skills, education, research, and project history |
| [Contact](./contact.html) | Contact form and professional links |
| [`projects/`](./projects/) | Detailed project architecture, workflow, metrics, and technology pages |

## Technology stack

### AI and data

- Python
- TensorFlow and PyTorch
- Scikit-learn and LightGBM
- OpenCV, YOLO, ByteTrack, and MediaPipe
- Pandas, NumPy, and data visualization tooling
- LangChain, LangGraph, vector search, and RAG pipelines

### Backend and applications

- Django and FastAPI
- REST APIs and authentication
- Flutter, Node.js, and TypeScript
- Databases, data pipelines, and automation

### Portfolio frontend

- Semantic HTML5
- CSS custom properties and responsive layouts
- Vanilla JavaScript
- Bootstrap utilities
- Intersection Observer and CSS keyframe animations
- GitHub Pages

## Repository structure

```text
Hamza-code-hub.github.io/
|-- css/
|   |-- my.css                 # Shared themes, layouts, and animation system
|   `-- theme.css              # Bootstrap-based foundation
|-- images/                    # Profile, platform, and case-study media
|-- js/
|   |-- dark.js                # Persistent light/dark theme controller
|   |-- sidebar.js             # Shared navigation for inner pages
|   |-- site-effects.js        # Homepage/listing animations and visual models
|   `-- project-animate.js      # Project-page architecture and metric animation
|-- projects/                  # Individual project case studies
|-- resume/
|   |-- index.html              # Online resume page
|   `-- Muhammad-Hamza-Resume.pdf
|-- index.html
|-- portfolio.html
|-- services.html
|-- contact.html
|-- robots.txt
|-- sitemap.xml
`-- README.md
```

## Theme behavior

The site checks for a saved theme preference first. If none exists, it uses the operating-system preference. The selected theme is stored in `localStorage` and shared by every page.

Both themes use the same semantic color variables, so cards, forms, project diagrams, text, navigation, and interactive states remain readable and consistent.

## Animation architecture

Animations are implemented without a heavy animation framework:

1. `site-effects.js` limits the homepage to three selected projects and builds animated project visualizations.
2. Intersection Observer reveals sections and cards only when they enter the viewport.
3. Fine-pointer devices receive subtle interactive lighting and perspective effects.
4. `project-animate.js` adds animated data flow, statistics, progress bars, and architecture nodes to case studies.
5. `prefers-reduced-motion` disables nonessential movement for accessibility.

The resume intentionally does not load the portfolio animation scripts. Its screen layout mirrors a clean two-page document, uses a wider 60/40 experience-and-skills structure, and switches to exact A4 sheets when printed.

### Animated project models

Static thumbnails are replaced by purpose-built motion models that explain what each selected system does:

| Visual model | Animation behavior |
| --- | --- |
| VisionGuard | Moving forklift and pedestrian tracks, risk line, detection zone, and live telemetry |
| NeuroInsight AI | Breathing brain geometry, pulsing clinical nodes, and signal wave |
| Flood Prediction | Animated feature bars and model-performance telemetry |
| Attendance System | Live presence ring, synchronized workforce rows, and status indicators |
| AeroNav Sim | Autonomous drone marker following a multi-waypoint route |
| AI Virtual Painter | Gesture hand motion, moving cursor, and progressively drawn strokes |

Every case-study page also receives an animated architecture panel showing input, intelligence, decision, and output stages with moving data packets. These animations are built from semantic HTML and CSS, remain theme-aware, and scale down for mobile layouts.

## Resume

- [View the online resume](./resume/)
- [Download the PDF resume](./resume/Muhammad-Hamza-Resume.pdf)

The online version includes print-specific CSS for clean document output.

## Running locally

No build step is required. Open `index.html` directly, or serve the repository with any static file server.

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The site is deployed through GitHub Pages from this repository. Changes to the published branch are served as a static website.

SEO support includes:

- Semantic metadata
- Open Graph and social-card information
- Schema.org structured data
- `robots.txt`
- `sitemap.xml`
- Accessible image descriptions and navigation labels

## Research

My published work includes research on multi-class Alzheimer's disease classification using volumetric brain MRI and 3D deep learning. The portfolio connects this research background with practical AI software engineering and production-oriented delivery.

## Contact

- Portfolio: [hamza-code-hub.github.io](https://hamza-code-hub.github.io/)
- GitHub: [Hamza-code-hub](https://github.com/Hamza-code-hub)
- LinkedIn: [hamzzaz](https://www.linkedin.com/in/hamzzaz)
- Email: [hamza.ai.official@gmail.com](mailto:hamza.ai.official@gmail.com)

---

<div align="center">

**Research -> Engineering -> Reliable AI systems**

</div>
