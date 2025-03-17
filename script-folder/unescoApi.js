const UNESCO_API_KEY = 'YOUR_API_KEY'; // Replace with your UNESCO API key
const BASE_URL = 'https://api.uis.unesco.org/sdmx/data/UNESCO,EDN_PTTR/';

// Indicators we'll use for scoring
const INDICATORS = {
    STUDENT_TEACHER_RATIO: 'EDN_PTTR_L1',
    COMPLETION_RATE: 'COMP.1',
    LITERACY_RATE: 'LR.AG15T24'
};

async function fetchUnescoData(countryCode) {
    try {
        // Add rate limiting to avoided API throttling
        await new Promise(resolve => setTimeout(resolve, 100));
        const response = await fetch(`${BASE_URL}${INDICATORS.STUDENT_TEACHER_RATIO}/${countryCode}?format=json&subscription-key=${UNESCO_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching UNESCO data for ${countryCode}:`, error);
        return null;
    }
}

// Add batch processing to handle many countries efficiently
async function processBatch(countries, batchSize = 5) {
    const results = [];
    for (let i = 0; i < countries.length; i += batchSize) {
        const batch = countries.slice(i, i + batchSize);
        const batchPromises = batch.map(async country => {
            const [name, code] = country;
            const data = await fetchUnescoData(code);
            return { name, code, data };
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    return results;
}

// Update the main data transformation function
export async function getTransformedCountryData() {
    const countries = Object.entries(countryMapping);
    const batchResults = await processBatch(countries);
    
    return batchResults
        .map(({ name, data }) => {
            if (!data) return null;
            
            const metrics = processUnescoMetrics(data);
            const score = calculateCountryScore(metrics);
            const existingData = initialMapData.find(item => item[2] === name);
            
            return existingData ? [
                existingData[0],
                existingData[1],
                name,
                score,
                existingData[4]
            ] : null;
        })
        .filter(item => item !== null);
}

function normalizeScore(value, min, max) {
    return ((value - min) / (max - min)) * 3.6 + 1.3; 
}

function extractMetric(data, indicator) {
    try {
        // Add this function to properly extract metrics from UNESCO API response
        const latestData = data.data?.[0]?.observations?.[0]?.value ?? null;
        return latestData ? parseFloat(latestData) : null;
    } catch (error) {
        console.error(`Error extracting ${indicator}:`, error);
        return null;
    }
}

function processUnescoMetrics(data) {
    const metrics = {
        studentTeacherRatio: extractMetric(data, INDICATORS.STUDENT_TEACHER_RATIO) ?? 30,
        completionRate: extractMetric(data, INDICATORS.COMPLETION_RATE) ?? 50,
        literacyRate: extractMetric(data, INDICATORS.LITERACY_RATE) ?? 70
    };

    // Normalize metrics to make higher values represent greater need
    metrics.studentTeacherRatio = normalizeScore(metrics.studentTeacherRatio, 10, 50);
    metrics.completionRate = normalizeScore(100 - metrics.completionRate, 0, 100);
    metrics.literacyRate = normalizeScore(100 - metrics.literacyRate, 0, 100);

    return metrics;
}

function calculateCountryScore(metrics) {
    // Calculate weighted score based on metrics
    // Adjust weights and calculation based on your needs
    const weights = {
        studentTeacherRatio: 0.4,
        completionRate: 0.3,
        literacyRate: 0.3
    };
    
    let score = (
        (metrics.studentTeacherRatio * weights.studentTeacherRatio) +
        (metrics.completionRate * weights.completionRate) +
        (metrics.literacyRate * weights.literacyRate)
    );
    
    // Normalize to 1.3-4.9 scale
    return normalizeScore(score, 0, 100);
}
