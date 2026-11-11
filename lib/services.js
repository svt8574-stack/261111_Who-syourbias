// ==============================================================================
// 파일명: lib/services.js
// 설명: OpenAI GPT-4o-mini 기반 궁합 해설 생성 서비스 (연애, 결혼 시뮬레이션)
// ==============================================================================

const OpenAI = require('openai');

// OpenAI 클라이언트 싱글톤 인스턴스
let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * AI 해설 텍스트 길이 및 필수 필드 유효성 검증
 * @param {object} parsed 
 * @returns {boolean}
 */
function validateAIResponseFields(parsed) {
  if (!parsed || typeof parsed !== 'object') return false;

  const { headline, description, datingScenario, marriageScenario } = parsed;

  if (typeof headline !== 'string' || headline.trim().length === 0 || headline.length > 40) {
    return false;
  }
  if (typeof description !== 'string' || description.trim().length === 0 || description.length > 300) {
    return false;
  }
  if (typeof datingScenario !== 'string' || datingScenario.trim().length === 0 || datingScenario.length > 150) {
    return false;
  }
  if (typeof marriageScenario !== 'string' || marriageScenario.trim().length === 0 || marriageScenario.length > 150) {
    return false;
  }

  return true;
}

/**
 * OpenAI GPT-4o-mini를 호출하여 궁합 해설을 생성합니다. (글자 수 초과 시 1회 재시도)
 * @param {object} params
 * @param {string} params.biasName - 최애 이름
 * @param {object} params.myElement - 나의 오행
 * @param {object} params.biasElement - 최애의 오행
 * @param {string} params.relation - 오행 관계 (예: "내가 최애를 돕는 상생")
 * @param {number} params.score - 궁합 점수
 * @param {string} params.grade - 궁합 등급
 * @returns {Promise<{ headline: string, description: string, datingScenario: string, marriageScenario: string }>}
 */
async function generateAIInterpretation(params) {
  const openai = getOpenAIClient();

  const systemPrompt = `너는 팬덤형 간이 오행 궁합 테스트의 한국어 콘텐츠 작가다. 
입력으로 제공된 오행, 관계, 점수, 등급을 바꾸거나 새로 계산하지 마라. 
연예인의 실제 감정·성격·관계 성사 가능성을 단정하지 마라. 
실제 미래 예언이 아닌 상상 속 상황을 밝고 귀엽게 팬심 가득 묘사하라. 
연애 시나리오는 데이트·설렘 중심, 결혼 시나리오는 일상·배려·파트너십 중심으로 서로 다르게 작성하라. 
반드시 아래의 JSON 형식으로만 응답하고, 각 필드의 글자 수 제한을 엄격히 지켜라:
{
  "headline": "한 줄 요약 (공백 포함 40자 이내)",
  "description": "오행 조화 상세 해설 (공백 포함 300자 이내)",
  "datingScenario": "연애 시나리오 (공백 포함 150자 이내)",
  "marriageScenario": "결혼/동반자 시나리오 (공백 포함 150자 이내)"
}`;

  const userPrompt = `
- 사용자 오행: ${params.myElement.name}(${params.myElement.hanja}, 상징: ${params.myElement.symbol})
- 최애 이름: ${params.biasName}
- 최애 오행: ${params.biasElement.name}(${params.biasElement.hanja}, 상징: ${params.biasElement.symbol})
- 오행 관계: ${params.relation}
- 궁합 점수: ${params.score}점
- 궁합 등급: ${params.grade}
`;

  let lastError = null;

  // 최대 2회 시도 (초기 1회 + 실패 시 재시도 1회)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 600
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 응답 내용이 비어있습니다.');
      }

      const parsed = JSON.parse(content);

      if (validateAIResponseFields(parsed)) {
        return {
          headline: parsed.headline.trim(),
          description: parsed.description.trim(),
          datingScenario: parsed.datingScenario.trim(),
          marriageScenario: parsed.marriageScenario.trim()
        };
      } else {
        lastError = new Error(`AI 생성 결과가 글자 수 규격을 만족하지 못했습니다. (시도 ${attempt}/2)`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`AI 해설 생성에 실패했습니다: ${lastError.message}`);
}

module.exports = {
  generateAIInterpretation
};
