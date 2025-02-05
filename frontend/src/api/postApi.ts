import axios from 'axios';

const API_KEY = 'sk-c61481ce440445db9dc8b12298f7aecb';
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

interface PostRequest {
  model: string;
  input: {
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
  parameters: {
    result_format: string;
    max_tokens: number;
    temperature: number;
  };
}

interface PostResponse {
  title: string;
  price: number;
  tag: string;
  post_type: string;
  details: string;
}


// 生成模板
export const generateTemplate = async (text: string): Promise<PostResponse | null> => {
  const request: PostRequest = {
    model: 'qwen-turbo',
    input: {
      messages: [
        {
          role: 'system',
          content: '请根据用户输入生成符合以下结构的商品信息：{ "title": "商品名", "price": 价格, "tag": "资料作业" 或  "跑步打卡" 或 "生活用品" 或 "数码电子" 或 "拼单组队" 或 "其他", "post_type": "sell" 或 "receive", "details": "详情"  }',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    },
    parameters: {
      result_format: 'json',
      max_tokens: 150,
      temperature: 0.7,
    },
  };

  try {
    const response = await axios.post(API_URL, request, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (response.status === 200) {
      const responseData = response.data.output.choices[0].message.content;
      // 测试数据："出c语言教材，10r。有圈画，略有磨损折页，完美主义者勿扰。"
      // API返回的数据格式如下：
      // {
      //   "title": "c语言教材",
      //   "price": 10,
      //   "tag": "资料作业",
      //   "post_type": "sell",
      //   "details": "有圈画，略有磨损折页，完美主义者勿扰。"
      // }
      return JSON.parse(responseData);
    } else {
      console.error('请求失败', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.error('请求错误', error);
    return null;
  }
};
