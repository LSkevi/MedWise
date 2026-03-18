# MedWise

Intelligent medication recommendation system powered by government medical databases.

## What It Does

Enter a disease or symptom and get medication recommendations with:
- Drug name and classification
- FDA-approved indications
- Side effects and contraindications
- Warnings and dosage information
- Links to patient-friendly resources

## Data Sources

All data comes from free, government-backed medical APIs:

| API | Provider | Purpose |
|-----|----------|---------|
| [RxClass](https://rxnav.nlm.nih.gov/RxClassIntro.html) | NIH/NLM | Disease-to-drug mapping (MED-RT `may_treat`) |
| [OpenFDA](https://open.fda.gov/apis/drug/label/) | FDA | Drug labeling, warnings, side effects |
| [RxNorm](https://www.nlm.nih.gov/research/umls/rxnorm/) | NIH/NLM | Standardized drug names and classes |
| [MedlinePlus](https://medlineplus.gov/) | NLM | Patient-friendly health information |

## Architecture

- **Frontend**: Next.js 16 + Tailwind CSS + Lucide Icons
- **Backend**: Python FastAPI
- **Deployment**: Vercel Services (multi-service)

```
MedWise/
├── apps/web/          # Next.js frontend
├── backend/           # FastAPI backend
└── vercel.json        # Vercel Services config
```

## Development

### Backend

```bash
cd backend
pip install -e .
uvicorn main:app --reload
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

### Full Stack (Vercel)

```bash
vercel dev
```

## Disclaimer

This application is for **educational purposes only** and is NOT medical advice. Always consult a qualified healthcare professional before taking any medication.

## License

MIT
