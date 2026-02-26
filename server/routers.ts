import { z } from "zod";
import { invokeLLM } from "./llm";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取评分标准文件
let SCORING_STANDARD = '';
try {
  const standardPath = path.join(__dirname, '../data/standards.txt');
  SCORING_STANDARD = fs.readFileSync(standardPath, 'utf-8');
  console.log('✅ 评分标准加载成功，长度：', SCORING_STANDARD.length);
} catch (error) {
  console.error('❌ 评分标准文件读取失败:', error);
  SCORING_STANDARD = '评分标准加载失败，使用内置简化版';
}

export const appRouter = {
  essay: {
    evaluate: async ({ input }: { input: { essay: string } }) => {
      const { essay } = input;

      const prompt = `你是一位资深的美国大学申请文书评估专家。请严格按照以下标准评估这篇文书。

${SCORING_STANDARD}

待评估文书：
${essay}

请以JSON格式返回评估结果，格式必须完全如下：
{
  "totalScore": 68,
  "deductPoints": 22,
  "overallSummary": "文书主旨总结",
  "categories": [
    {
      "categoryName": "优势突出",
      "score": 16,
      "maxScore": 30,
      "standards": [
        {
          "standardName": "智慧活跃度",
          "score": 3,
          "maxScore": 5,
          "problem": "问题的总体描述",
          "examples": [
            {
              "original": "原文引用",
              "issue": "具体问题说明",
              "suggestion": "修改建议",
              "reason": "为什么要这样改",
              "comparison": "改前改后的效果对比"
            }
          ]
        }
      ]
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { 
            role: "system", 
            content: "你是一位严格的美国大学申请文书评估专家，擅长挑刺和发现问题。你会深入分析元认知过程、判断困难质量、评估能力合理性。只列不足，不说优点。" 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        top_p: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "essay_evaluation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                totalScore: { type: "number" },
                deductPoints: { type: "number" },
                overallSummary: { type: "string" },
                categories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      categoryName: { type: "string" },
                      score: { type: "number" },
                      maxScore: { type: "number" },
                      standards: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            standardName: { type: "string" },
                            score: { type: "number" },
                            maxScore: { type: "number" },
                            problem: { type: "string" },
                            examples: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  original: { type: "string" },
                                  issue: { type: "string" },
                                  suggestion: { type: "string" },
                                  reason: { type: "string" },
                                  comparison: { type: "string" }
                                },
                                required: ["original", "issue", "suggestion", "reason", "comparison"],
                                additionalProperties: false
                              }
                            }
                          },
                          required: ["standardName", "score", "maxScore", "problem", "examples"],
                          additionalProperties: false
                        }
                      }
                    },
                    required: ["categoryName", "score", "maxScore", "standards"],
                    additionalProperties: false
                  }
                }
              },
              required: ["totalScore", "deductPoints", "overallSummary", "categories"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content in response");
      
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      return JSON.parse(contentStr);
    },
  },
};

export type AppRouter = typeof appRouter;