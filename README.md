#  Subject Tree • Colorful 3D Animated Planner

A beautiful, interactive subject learning planner with animated tree diagrams and progress tracking. Built with vanilla JavaScript and SVG animations.

##  Features
- **Visual Tree Diagram** – Radial SVG layout with animated nodes
- **Progress Tracking** – Real-time progress bar with gradient animations
- **Interactive Controls** – Click to toggle, rename inline, reorder topics
- **Customizable Theme** – Three-color picker for personalization
- **Confetti Celebration** – Triggers at 100% completion
- **Local Storage** – Auto-saves, zero external dependencies
- **Responsive** – Works on all screen sizes

##  Quick Start
1. Download `index.html`
2. Open it in any modern browser
3. Start planning your learning journey!

No build tools, no dependencies, no setup required.

##  Usage
### Basic Workflow
1. **Set Your Subject** – Enter the main topic you're learning (e.g., "Physics")
2. **Add a Verb** – Choose an action word for the ribbon (e.g., "Master", "Learn")
3. **Add Subtopics** – Break down your subject into manageable pieces
4. **Track Progress** – Check off topics as you complete them
5. **Customize** – Adjust colors to match your style

### Controls
- **Checkbox** – Mark topic as complete
- **Delete** – Remove a topic
- **Move Up** – Reorder topics
- **Save** – Manual save (auto-saves on changes)
- **Reflow** – Recompute diagram layout
- **Shuffle** – Randomize node positions
- **Reset** – Clear all data (with confirmation)

### Tips
- Click topic names in the list to rename them inline
- Click nodes in the diagram to toggle completion status
- Use the color picker to personalize your theme
- Hover over nodes for tooltips with full names

##  Customization
The app includes three customizable colors:

- **Primary** – Main accent color (default: purple `#7c5cff`)
- **Secondary** – Gradient endpoint (default: cyan `#00d2ff`)
- **Good** – Completion color (default: green `#22c55e`)

Colors update the progress bar, ribbon gradient, and completion states in real-time.

##  Data Storage
All data is stored locally in `localStorage` under the key `subject_tree_v1`:

```javascript
{
  subject: string,
  verb: string,
  topics: [{id, name, done}],
  theme: {primary, secondary, good},
  layoutSeed: number
}
```

**Privacy**: Nothing leaves your browser. No servers, no tracking, no accounts.

##  Animations
- **Dashed edges** animate around the tree
- **Progress bar** has moving diagonal stripes
- **Confetti burst** celebrates 100% completion
- **Nodes** have 3D perspective hover effects
- **Toast notifications** pop in smoothly

##  Technical Details
- **Pure HTML/CSS/JS** – No frameworks or libraries
- **SVG Graphics** – Scalable vector diagrams with gradients
- **CSS Variables** – Dynamic theming system
- **Canvas API** – Confetti particle effects
- **LocalStorage API** – Data persistence
- **Responsive Grid** – Adapts to screen size

##  Browser Support
Works in all modern browsers that support:
- ES6+ JavaScript
- SVG 1.1
- CSS Grid & Custom Properties
- Canvas 2D API

##  License
MIT License – Free to use, modify, and distribute.

##  Contributing
This is a single-file application. To contribute:

1. Fork the repository
2. Make your changes to `index.html`
3. Test thoroughly in multiple browsers
4. Submit a pull request

##  Use Cases
- **Students** – Track learning progress across course topics
- **Self-learners** – Organize independent study
- **Teachers** – Demonstrate curriculum structure
- **Project planning** – Break down complex projects
- **Skill development** – Map out competency trees

##  Known Issues
- Very long topic names (>14 chars) are truncated in diagram
- Layout seed randomization may occasionally overlap nodes
- No export/import functionality (planned for future)

##  Future Ideas
- Export diagram as PNG/SVG
- Import/export JSON data
- Multiple subjects with tabs
- Custom node shapes/icons
- Hierarchical subtopics (nested trees)
- Dark/light mode toggle

---

**Built with ❤️** – A zero-dependency web app for visual learners.
