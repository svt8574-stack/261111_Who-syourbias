// ==============================================================================
// 파일명: api/analyze.js
// 설명: 궁합 분석 처리 핸들러 (로컬 Express 및 Vercel 서버리스 함수 겸용)
// ==============================================================================

const { validateAnalyzeRequest } = require('../lib/validation');
const { calculateElement, calculateCompatibility } = require('../lib/elements');
const { generateAIInterpretation } = require('../lib/services');

/**
 * 궁합 분석 메인 핸들러
 */
async function handler(req, res) {
  // 1. HTTP 메서드 확인 (POST만 허용)
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: '허용되지 않는 HTTP 메서드입니다. POST 요청만 가능합니다.'
    });
  }

  try {
    // 2. 클라이언트 입력값 유효성 검증
    const validation = validateAnalyzeRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        ok: false,
        error: validation.error
      });
    }

    const { myBirthDate, biasName, biasBirthDate } = validation.sanitizedData;

    // 3. 결정론적 간이 오행 계산 (연도 끝자리 기반)
    const myElement = calculateElement(myBirthDate);
    const biasElement = calculateElement(biasBirthDate);

    // 4. 오행 간의 상생/상극 관계, 점수, 등급 산출
    const compatibility = calculateCompatibility(myElement, biasElement);

    // 5. OpenAI GPT-4o-mini를 통한 밝고 팬심 가득한 해설 생성
    let aiContent;
    try {
      aiContent = await generateAIInterpretation({
        biasName,
        myElement,
        biasElement,
        relation: compatibility.relation,
        score: compatibility.score,
        grade: compatibility.grade
      });
    } catch (aiError) {
      console.error('[AI 서비스 오류]:', aiError.message);
      return res.status(502).json({
        ok: false,
        error: 'AI 해설을 생성하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    // 6. 최종 성공 응답 반환
    return res.status(200).json({
      ok: true,
      data: {
        myElement: {
          key: myElement.key,
          name: myElement.name,
          hanja: myElement.hanja,
          symbol: myElement.symbol,
          icon: myElement.icon
        },
        biasElement: {
          key: biasElement.key,
          name: biasElement.name,
          hanja: biasElement.hanja,
          symbol: biasElement.symbol,
          icon: biasElement.icon
        },
        relation: compatibility.relation,
        score: compatibility.score,
        grade: compatibility.grade,
        headline: aiContent.headline,
        description: aiContent.description,
        datingScenario: aiContent.datingScenario,
        marriageScenario: aiContent.marriageScenario,
        disclaimer: '양력 출생연도 기준 간이 오행 테스트입니다.'
      }
    });

  } catch (error) {
    console.error('[서버 내부 오류]:', error.message);
    return res.status(500).json({
      ok: false,
      error: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
}

module.exports = handler;

