// Vercel Speed Insights integration
import { injectSpeedInsights } from '../node_modules/@vercel/speed-insights/dist/index.mjs';

// Initialize Speed Insights
injectSpeedInsights({
    debug: false
});
