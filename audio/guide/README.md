# Portfolio narration

These static MP3 recordings use the tour and rule-based answer text exported by `PortfolioLocale.narrationEntries()` in the site's 20 supported languages. Service answers describe the published services; pricing and timing answers ask visitors to share their requirements. The manifest's `text` matches the displayed source exactly. Where present, `spokenText` preserves the meaning and uses native-script pronunciations of technical names so the speech model reads them clearly.

Voices are Microsoft neural text-to-speech voices at a speech rate of `-5%`. Each voice is checked against the speech service's available voice list during generation. Voice support is documented in [Microsoft's language and voice reference](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support).

| Language | Voice |
| --- | --- |
| English | en-US-GuyNeural |
| Urdu | ur-PK-AsadNeural |
| Arabic | ar-SA-HamedNeural |
| Chinese | zh-CN-YunyangNeural |
| Hindi | hi-IN-MadhurNeural |
| Spanish | es-ES-AlvaroNeural |
| French | fr-FR-HenriNeural |
| Portuguese | pt-BR-AntonioNeural |
| Bengali | bn-BD-PradeepNeural |
| Russian | ru-RU-SvetlanaNeural |
| Indonesian | id-ID-ArdiNeural |
| German | de-DE-ConradNeural |
| Japanese | ja-JP-KeitaNeural |
| Turkish | tr-TR-AhmetNeural |
| Vietnamese | vi-VN-NamMinhNeural |
| Korean | ko-KR-InJoonNeural |
| Thai | th-TH-NiwatNeural |
| Persian | fa-IR-FaridNeural |
| Tamil | ta-IN-ValluvarNeural |
| Telugu | te-IN-MohanNeural |

`js/portfolio-narration.js` pairs every exact transcript with its local asset. The site requests a recording when it is played, without contacting a speech service or loading the generation tools. The generation tools are temporary build utilities under `.tmp`, not website dependencies.

Each generated recording is checked for a valid MPEG frame duration and matching spoken text in the speech service's word-boundary metadata. Changing the published narration requires regenerating the matching audio and manifest together.
