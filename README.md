[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/PrivatePope/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/PrivatePope/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun bounty `gta6-trophy-guide-01`.

Built for the [GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

## What it is

- **Checklist** — every trophy with its official name, description and grade as PlayStation publishes them. Check trophies off as you earn them; progress is saved in your browser (localStorage) and can be exported to a file and imported back.
- **Counters** — trophies with a target (250 stunts, 42 shooting-range golds, 100 WAiNK scans…) get a counter that tracks your progress and marks the trophy earned when you hit the target.
- **Filters** — by kind (story, missable, collectibles, activities, completion, online), by grade, by search, and a hide-earned switch.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Guide pane** — every trophy has a guide in our own words that cites its sources: what to do, where and how, and when it can be missed.
- **Roadmap** — three stages to the platinum, built from the official descriptions, with save advice and the cheats warning.
- **Missables** — the one possibly-missable trophy (Positive Mental Attitude) explained in full, plus the things that look missable but are not.

## The list

55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 0 online — every trophy is single-player. PowerPyx rates the platinum 4 out of 10 at about 200 hours, in one playthrough.

## Run it

Any static server rooted at `app/` works, for example:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080. No network needed — the app fetches nothing.

For screenshots, the app takes a `?shot=` parameter (`cover`, `detail`, `roadmap`, `missables`) that seeds a fixed 13-of-55 progress and opens one view. Real users never see this: without it the guide opens empty, as new.

## Sources

The trophy names, descriptions and grades come from the official list as Exophase and PSNProfiles publish it. The how-to detail is drawn from PowerPyx's GTA 6 Trophy Guide & Roadmap and Six Shore's GTA 6 Trophy and Achievement List, and each trophy's guide names its sources beside it — never copied, always cited. Where the exact method is not yet confirmed (five hidden trophies), the guide says so plainly instead of inventing a step.

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/
- Exophase — GTA VI trophy list: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — GTA VI trophies: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- Six Shore — GTA 6 Trophy and Achievement List: https://sixshore.com/gta-6/guides/trophies-and-achievements/

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts` (the kit's copy, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see LICENSE.
