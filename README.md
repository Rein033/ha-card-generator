# HA Card Generator

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-rein033-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/rein033)
Build Home Assistant dashboard cards with a form, see a live preview in light and dark, and copy the YAML.

**Use it:** [uselesssite.nl/ha-card-generator](https://uselesssite.nl/ha-card-generator/)

- Built-in cards: Tile (with features), Entities, Button, Glance, Gauge, Thermostat, Light, Weather, Markdown, Heading
- Layout: vertical stack, horizontal stack and grid, with cards inside them (as deep as you like)
- Community cards: Mushroom (entity, light, template, chips) and button-card
- [Universal 3D Cards](https://uselesssite.nl/universal-3d-cards/): 3D printer card and printer group
- Examples to start from, paste existing YAML to edit it, share a design with a link
- Width in sections view (`grid_options`)

Everything runs in your browser. Nothing is sent anywhere; a share link holds the card in the link itself.

## Development

Plain HTML, CSS and JavaScript, no build step. Bump the `?v=` number on the script and style links in `index.html`
after a change, so browsers and caches load the new files. `cards.js` holds the card definitions (fields and preview per card),
`app.js` the editor. Open `index.html` through any static web server.

## Support

Everything here is free. If it saves you time or makes your dashboard nicer, you can [buy me a coffee](https://buymeacoffee.com/rein033) ☕

## License

[MIT](LICENSE). Not affiliated with Home Assistant or the Open Home Foundation.
