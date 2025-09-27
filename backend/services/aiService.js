const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateSustainabilityReport(projectData, analysisData) {
    try {
      const prompt = this.buildReportPrompt(projectData, analysisData);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert sustainability consultant specializing in Life Cycle Assessment (LCA) for the metallurgy and mining sector. Generate comprehensive, professional sustainability reports based on LCA data. Focus on circular economy principles, environmental impacts, and actionable recommendations. Use clear, professional language suitable for industry stakeholders.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI report:', error);
      throw new Error('Failed to generate AI-powered report');
    }
  }

  buildReportPrompt(projectData, analysisData) {
    return `
Generate a comprehensive sustainability report for the following LCA project:

PROJECT INFORMATION:
- Name: ${projectData.name}
- Industry: ${projectData.industry}
- Product: ${projectData.product}
- Functional Unit: ${projectData.functionalUnit}
- Description: ${projectData.description || 'No description provided'}

ANALYSIS RESULTS:
- Total CO₂ Emissions: ${analysisData.totalCO2 || 0} kg CO₂ eq
- Total Energy Consumption: ${analysisData.totalEnergy || 0} kWh
- Overall Recycling Rate: ${analysisData.overallRecyclingRate || 0}%
- Circularity Score: ${analysisData.circularityScore || 0}/100
- Sustainability Rating: ${analysisData.sustainabilityRating || 'F'}

PROCESSES (${projectData.processes?.length || 0} total):
${projectData.processes?.map(process => `
- ${process.name} (${process.type}): 
  * CO₂: ${process.impacts?.co2Emissions?.amount || process.predictions?.predictedCO2 || 0} kg
  * Energy: ${process.energy?.electricity?.amount || process.predictions?.predictedEnergy || 0} kWh
  * Recycling: ${process.circularity?.recyclability || process.predictions?.predictedRecyclingRate || 0}%
  * Pathway: ${process.predictions?.pathwayClassification || 'Not analyzed'}
`).join('')}

Please provide:
1. Executive Summary (2-3 paragraphs)
2. Key Environmental Findings (bullet points)
3. Circularity Assessment (detailed analysis)
4. Process-Specific Insights
5. Actionable Recommendations (prioritized by impact)
6. Industry Best Practices
7. Next Steps for Improvement

Format the response in clear sections with professional language suitable for industry stakeholders.
    `.trim();
  }

  async generateRecommendations(analysisData, processes) {
    try {
      const prompt = this.buildRecommendationsPrompt(analysisData, processes);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a sustainability expert. Generate specific, actionable recommendations for improving environmental performance and circularity in metallurgy processes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return 'Unable to generate AI recommendations at this time.';
    }
  }

  buildRecommendationsPrompt(analysisData, processes) {
    return `
Based on this LCA analysis, provide specific recommendations:

ANALYSIS SUMMARY:
- Circularity Score: ${analysisData.circularityScore || 0}/100
- Recycling Rate: ${analysisData.overallRecyclingRate || 0}%
- CO₂ Emissions: ${analysisData.totalCO2 || 0} kg CO₂ eq
- Energy Use: ${analysisData.totalEnergy || 0} kWh

PROCESSES:
${processes.map(p => `- ${p.name}: ${p.predictions?.pathwayClassification || 'Not analyzed'} pathway, ${p.circularity?.recyclability || 0}% recyclability`).join('\n')}

Provide 5-7 specific, actionable recommendations prioritized by impact and feasibility.
    `.trim();
  }

  async generateProcessInsights(process) {
    try {
      const prompt = `
Analyze this metallurgy process and provide insights:

Process: ${process.name}
Type: ${process.type}
CO₂: ${process.impacts?.co2Emissions?.amount || 0} kg
Energy: ${process.energy?.electricity?.amount || 0} kWh
Recycling: ${process.circularity?.recyclability || 0}%
Pathway: ${process.predictions?.pathwayClassification || 'Not analyzed'}

Provide 2-3 key insights about this process's environmental performance and circularity potential.
      `.trim();

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a process engineering expert. Provide concise, technical insights about metallurgy processes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating process insights:', error);
      return 'Unable to generate process insights at this time.';
    }
  }
}

module.exports = new AIService();
