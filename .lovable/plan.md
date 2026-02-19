

## Fix: Geographically Accurate Southern Africa Map

### Problem
The current map image at `src/assets/southern-africa-map.png` has incorrect geography for the five countries (Lesotho, South Africa, Botswana, eSwatini, Namibia).

### Fix
Replace the map with a new, geographically accurate image generated using the AI image model. The prompt will specify correct positioning:

- **South Africa** at the southern tip of the continent
- **Lesotho** fully enclosed within South Africa (small mountainous kingdom)
- **eSwatini** on South Africa's northeast border, also bordered by Mozambique
- **Botswana** north of South Africa, west of Zimbabwe
- **Namibia** on South Africa's northwest border, along the Atlantic coast

The image will be regenerated via the AI image generation endpoint and saved to `src/assets/southern-africa-map.png`. No other code changes needed -- the Coverage component already references this file.

