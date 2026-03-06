When you perform information extraction or structured data generation tasks, the large language model (LLM) might return extra text, such as
```` ```json ````
. This can cause downstream parsing to fail. Use structured output to ensure that the LLM returns a standard JSON string. With JSON Schema mode, you can also precisely control the output structure and types, which eliminates the need for extra validation or retries.

Implementation guide
--------------------

Structured output supports two modes: JSON Object and JSON Schema.

* **JSON Object mode**
  : Ensures the output is a standard JSON string, but does not guarantee a specific structure. To use this mode:

  1. **Set**
     `response_format`
     : In the request body, set the
     `response_format`
     parameter to
     `{"type": "json_object"}`
     .
  2. **Include the JSON keyword in the prompt**
     : The system message or user message must contain the "JSON" keyword (case-insensitive). Otherwise, the model returns the following error:
     `'messages' must contain the word 'json' in some form, to use 'response_format' of type 'json_object'.`
* **JSON Schema mode**
  : Ensures the output conforms to a specified structure. To use this mode, set the
  `response_format`
  parameter to
  `{"type": "json_schema", "json_schema": {"strict": true, ...}}`
  .

  > The prompt does not need to include the JSON keyword.

Comparison:

| **Feature** | **JSON Object mode** | **JSON Schema mode** |
| --- | --- | --- |

|  |  |  |
| --- | --- | --- |
| **Feature** | **JSON Object mode** | **JSON Schema mode** |
| Outputs valid JSON | Yes | Yes |
| Strictly follows schema | No | Yes |
| Supported models | Most Qwen models | * qwen3-max series: qwen3-max, qwen3-max-2025-09-23 and later snapshots * qwen-plus series: qwen-plus, qwen-plus-latest, qwen-plus-2025-07-28 and later snapshots * qwen-flash series: qwen-flash, qwen-flash-2025-07-28 and later snapshots * Third-party: deepseek-v3.2 |
| `response_format` parameter | `{"type": "json_object"}` | `{"type": "json_schema", "json_schema": {"strict": true, ...}}` |
| Prompt requirements | Must include "JSON" | Explicit instructions are recommended |
| Scenarios | Flexible JSON output | Precise structure validation |

**Supported models**
--------------------

JSON Object

JSON Schema

Qwen

Kimi

GLM

* **Text generation models**

  + Qwen-Max series: qwen3-max (non-thinking mode), qwen3-max-2026-01-23 (non-thinking mode), qwen3-max-2025-09-23, qwen3-max-preview (non-thinking mode), qwen-max, qwen-max-latest, qwen-max-2025-01-25, and later snapshots
  + Qwen-Plus series (non-thinking mode): qwen3.5-plus, qwen3.5-plus-2026-02-15 and later snapshots, qwen-plus, qwen-plus-latest, qwen-plus-2024-12-20 and later snapshots
  + Qwen-Flash series (non-thinking mode): qwen3.5-flash, qwen3.5-flash-2026-02-23 and later snapshots, qwen-flash, qwen-flash-2025-07-28, and later snapshots
  + Qwen-Turbo series (non-thinking mode): qwen-turbo, qwen-turbo-latest, qwen-turbo-2024-11-01, and later snapshots
  + Qwen-Coder series: qwen3-coder-plus, qwen3-coder-plus-2025-07-22, qwen3-coder-flash, and qwen3-coder-flash-2025-07-28
  + Qwen-Long series: qwen-long-latest, and qwen-long-2025-01-25
* **Open source text generation models**

  + Qwen3.5 (non-thinking mode): qwen3.5-397b-a17b, qwen3.5-122b-a10b, qwen3.5-27b, qwen3.5-35b-a3b
  + Qwen3 (non-thinking mode)
  + Qwen3-Coder
  + Qwen2.5 series text models (excluding math and coder models)
* **Multimodal models**

  + Qwen3-VL-Plus series (non-thinking mode): qwen3-vl-plus, qwen3-vl-plus-2025-09-23, and later snapshots
  + Qwen3-VL-Flash series (non-thinking mode): qwen3-vl-flash, qwen3-vl-flash-2025-10-15, and later snapshots
  + QwenVL-Max series: qwen-vl-max (excluding the latest and snapshot versions)
  + QwenVL-Plus series: qwen-vl-plus (excluding the latest and snapshot versions)
* **Open source multimodal models**

  + Qwen3-VL (non-thinking mode)

**Note**

Models in thinking mode do not currently support structured output.

kimi-k2-thinking

Non-thinking mode: glm-5, glm-4.7, glm-4.6

* qwen3-max series: qwen3-max, qwen3-max-2025-09-23 and later snapshots
* qwen-plus series: qwen-plus, qwen-plus-latest, qwen-plus-2025-07-28 and later snapshots
* qwen-flash series: qwen-flash, qwen-flash-2025-07-28 and later snapshots
* Third-party: deepseek-v3.2

> More models will be supported gradually in the future.

> Not supported in thinking mode.

For more information about context windows, pricing, and snapshot versions, see
[Model list](https://modelstudio.console.alibabacloud.com/help/en/model-studio/models)
.

**Getting started**
-------------------

This section uses a simple example of information extraction from a personal profile to demonstrate how to use structured output.

You must
[obtain an API key](https://modelstudio.console.alibabacloud.com/help/en/model-studio/get-api-key)
and
[set the API key as an environment variable](https://modelstudio.console.alibabacloud.com/help/en/model-studio/configure-api-key-through-environment-variables)
. If you use the OpenAI SDK or DashScope SDK to make calls, you must also
[install the SDK](https://modelstudio.console.alibabacloud.com/help/en/model-studio/install-sdk)
.

OpenAI compatible

DashScope

Python

Node.js

curl

```py
from openai import OpenAI
import os

client = OpenAI(
    # The Different regions use separate API keys. If you have not set the environment variable, replace the following line with your API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # For the Beijing region, use https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

completion = client.chat.completions.create(
    model="qwen-flash",
    messages=[
        {
            "role": "system",
            "content": "Extract the name and age and return the information in JSON format."
        },
        {
            "role": "user",
            "content": "Hello everyone, my name is Alex Brown. I am 34 years old. My email is alexbrown@example.com. I enjoy playing basketball and traveling.", 
        },
    ],
    response_format={"type": "json_object"}
)

json_string = completion.choices[0].message.content
print(json_string)
```

### **Return result**

```
{
  "name": "Alex Brown",
  "age": 34
}
```

```ts
import OpenAI from "openai";

const openai = new OpenAI({
    // If you have not configured the environment variable, replace the following line with your API key: apiKey: "sk-xxx"
    apiKey: process.env.DASHSCOPE_API_KEY,
    // To use a model in the Beijing region, replace the baseURL with: https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

const completion = await openai.chat.completions.create({
    model: "qwen-flash",
    messages: [
        {
            role: "system",
            content: "Extract the name and age information and return it in JSON format."
        },
        {
            role: "user",
            content: "Hello everyone, my name is Alex Brown, I am 34 years old, and my email is alexbrown@example.com. I enjoy playing basketball and traveling."
        }
    ],
    response_format: {
        type: "json_object"
    }
});

const jsonString = completion.choices[0].message.content;
console.log(jsonString);
```

### **Return result**

```
{
  "Name": "Alex Brown",
  "Age": 34
}
```

```bash
# ======= Important =======
# Different regions use separate API keys. For more information about how to get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
#  If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# === Delete this comment before execution ===
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You need to extract the name (string), age (string), and email (string). Output a JSON string. Do not output any other content.
Examples:
Q: My name is John Doe, I am 25 years old, and my email is johndoe@example.com
A:{"name":"John Doe","age":"25 years old","email":"johndoe@example.com"}
Q: My name is Jane Smith, I am 30 years old, and my email is janesmith@example.com
A:{"name":"Jane Smith","age":"30 years old","email":"janesmith@example.com"}
Q: My name is Peter Jones, my email is peterjones@example.com, and I am 40 years old
A:{"name":"Peter Jones","age":"40 years old","email":"peterjones@example.com"}"
        },
        {
            "role": "user", 
            "content": "Hello everyone, my name is Alex Brown, and I am 34 years old. My email is alexbrown@example.com"
        }
    ],
    "response_format": {
        "type": "json_object"
    }
}'
```

### **Return result**

```json
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "{"name":"Alex Brown","age":"34 years old"}"
            },
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null
        }
    ],
    "object": "chat.completion",
    "usage": {
        "prompt_tokens": 207,
        "completion_tokens": 20,
        "total_tokens": 227,
        "prompt_tokens_details": {
            "cached_tokens": 0
        }
    },
    "created": 1756455080,
    "system_fingerprint": null,
    "model": "qwen-plus",
    "id": "chatcmpl-624b665b-fb93-99e7-9ebd-bb6d86d314d2"
}
```

Python

Java

curl

```py
import os
import dashscope
# To use a model in the Beijing region, replace the URL with https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages=[
    {
        "role": "system",
        "content": "Extract the name and age and return the information in JSON format."
    },
    {
        "role": "user",
        "content": "Hello everyone, my name is Alex Brown. I am 34 years old. My email is alexbrown@example.com. I enjoy playing basketball and traveling.", 
    },
]
response = dashscope.Generation.call(
    # To use a model in the China (Beijing) region, you must use an API key specific to that region. You can obtain an API key from: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If you have not configured the environment variable, replace the following line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv('DASHSCOPE_API_KEY'),
    model="qwen-flash", 
    messages=messages,
    result_format='message',
    response_format={'type': 'json_object'}
    )
json_string = response.output.choices[0].message.content
print(json_string)
```

### **Return result**

```json
{
  "name": "Alex Brown",
  "age": 34
}
```

The DashScope Java SDK version must be 2.18.4 or later.

```java
// The DashScope Java SDK version must be 2.18.4 or later.

import java.util.Arrays;
import java.lang.System;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.common.ResponseFormat;
import com.alibaba.dashscope.protocol.Protocol;

public class Main {
    public static GenerationResult callWithMessage() throws ApiException, NoApiKeyException, InputRequiredException {
        //  If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1
        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .content("Extract the name and age, and return the information in JSON format.")
                .build();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("Hello everyone, my name is Alex Brown, I am 34 years old, my email is alexbrown@example.com, and I like to play basketball and travel.")
                .build();
        ResponseFormat jsonMode = ResponseFormat.builder().type("json_object").build();
        GenerationParam param = GenerationParam.builder()
                // If you have not configured the environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-flash")
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .responseFormat(jsonMode)
                .build();
        return gen.call(param);
    }

    public static void main(String[] args) {
        try {
            GenerationResult result = callWithMessage();
            System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent());
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            // Use a logging framework to record the exception information.
            System.err.println("An error occurred while calling the generation service: " + e.getMessage());
        }
    }
}
```

### **Return result**

```json
{
  "name": "Alex Brown",
  "age": 34
}
```

```bash
# ======= Important =======
# Different regions use separate API keys. For more information about how to get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
#  If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===

curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -d '{
    "model": "qwen-flash",
    "input": {
        "messages": [
            {
                "role": "system",
                "content": "Extract the name and age, and return the information in JSON format."
            },
            {
                "role": "user", 
                "content": "Hello everyone, my name is Alex Brown, I am 34 years old, my email is alexbrown@example.com, and I like to play basketball and travel."
            }
        ]
    },
    "parameters": {
        "result_format": "message",
        "response_format": {
            "type": "json_object"
        }
    }
}'
```

### **Return result**

```json
{
    "output": {
        "choices": [
            {
                "finish_reason": "stop",
                "message": {
                    "role": "assistant",
                    "content": {
                        "Name": "Alex Brown",
                        "Age": 34
                    }
                }
            }
        ]
    },
    "usage": {
        "total_tokens": 72,
        "output_tokens": 18,
        "input_tokens": 54,
        "cached_tokens": 0
    },
    "request_id": "xxx-xxx-xxx-xxx-xxx"
}
```

**Image and video data processing**
-----------------------------------

In addition to text, multimodal models support structured output for image and video data. This feature enables visual information extraction, localization, and event detection.

> For image and video file limits, see
> [Image and video understanding](https://modelstudio.console.alibabacloud.com/help/en/model-studio/vision#430cb5ea4cety)
> .

OpenAI compatible

DashScope

Python

Node.js

curl

```py
import os
from openai import OpenAI

client = OpenAI(
    # Different regions use separate API keys. To get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # The following is If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)

completion = client.chat.completions.create(
    model="qwen3-vl-plus",
    messages=[
        {
            "role": "system",
            "content": [{"type": "text", "text": "You are a helpful assistant."}],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"
                    },
                },
                {"type": "text", "text": "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."},
            ],
        },
    ],
    response_format={"type": "json_object"}
)
json_string = completion.choices[0].message.content
print(json_string)
```

### **Return result**

```json
{
  "ticket": [
    {
      "travel_date": "2013-06-29",
      "trains": "Serial Number",
      "seat_num": "371",
      "arrival_site": "Development Zone",
      "price": "8.00"
    }
  ],
  "invoice": [
    {
      "invoice_code": "221021325353",
      "invoice_number": "10283819"
    }
  ]
}
```

```py
import OpenAI from "openai";

const openai = new OpenAI({
  // Different regions use separate API keys. To get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
  // If you have not configured an environment variable, replace the following line with your Model Studio API key: apiKey: "sk-xxx"
  apiKey: process.env.DASHSCOPE_API_KEY,
  // The following is If you use a model in the China (Beijing) region, replace the base_url with https://dashscope.aliyuncs.com/compatible-mode/v1
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

async function main() {
  const response = await openai.chat.completions.create({
    model: "qwen3-vl-plus",
    messages: [{
        role: "system",
        content: [{
          type: "text",
          text: "You are a helpful assistant."
        }]
      },
      {
        role: "user",
        content: [{
            type: "image_url",
            image_url: {
              "url": "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"
            }
          },
          {
            type: "text",
            text: "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (as an array, including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."
          }
        ]
      }
    ],
    response_format: {type: "json_object"}
  });
  console.log(response.choices[0].message.content);
}

main()
```

### **Return result**

```json
{
  "ticket": [
    {
      "travel_date": "2013-06-29",
      "trains": "Serial Number",
      "seat_num": "371",
      "arrival_site": "Development Zone",
      "price": "8.00"
    }
  ],
  "invoice": [
    {
      "invoice_code": "221021325353",
      "invoice_number": "10283819"
    }
  ]
}
```

```bash
# ======= Important =======
# The following is If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# Different regions use separate API keys. To get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
# === Delete this comment before execution ===

curl --location 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions' --header "Authorization: Bearer $DASHSCOPE_API_KEY" --header 'Content-Type: application/json' --data '{
  "model": "qwen3-vl-plus",
  "messages": [
  {"role":"system",
  "content":[
    {"type": "text", "text": "You are a helpful assistant."}]},
  {
    "role": "user",
    "content": [
      {"type": "image_url", "image_url": {"url": "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"}},
      {"type": "text", "text": "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (as an array, including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."}
    ]
  }],
  "response_format":{"type": "json_object"}
}'
```

### **Return result**

```json
{
  "choices": [{
    "message": {
      "content": {
        "ticket": [
          {
            "travel_date": "2013-06-29",
            "trains": "Serial Number",
            "seat_num": "371",
            "arrival_site": "Development Zone",
            "price": "8.00"
          }
        ],
        "invoice": [
          {
            "invoice_code": "221021325353",
            "invoice_number": "10283819"
          }
        ]
      },
      "role": "assistant"
    },
    "finish_reason": "stop",
    "index": 0,
    "logprobs": null
  }],
  "object": "chat.completion",
  "usage": {
    "prompt_tokens": 486,
    "completion_tokens": 112,
    "total_tokens": 598,
    "prompt_tokens_details": {
      "cached_tokens": 0
    }
  },
  "created": 1755767481,
  "system_fingerprint": null,
  "model": "qwen3-vl-plus",
  "id": "chatcmpl-33249829-e9f3-9cbc-93e4-0536b3d7d713"
}
```

Python

Java

curl

```py
import os
import dashscope

# The following is If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages = [
{
    "role": "system",
    "content": [
    {"text": "You are a helpful assistant."}]
},
{
    "role": "user",
    "content": [
    {"image": "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"},
    {"text": "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (as an array, including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."}]
}]
response = dashscope.MultiModalConversation.call(
    #If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key ="sk-xxx"
    api_key = os.getenv('DASHSCOPE_API_KEY'),
    model = 'qwen3-vl-plus',
    messages = messages,
    response_format={'type': 'json_object'}
)
json_string = response.output.choices[0].message.content[0]["text"]
print(json_string)
```

### **Return result**

```json
{
  "ticket": [
    {
      "travel_date": "2013-06-29",
      "trains": "Serial Number",
      "seat_num": "371",
      "arrival_site": "Development Zone",
      "price": "8.00"
    }
  ],
  "invoice": [
    {
      "invoice_code": "221021325353",
      "invoice_number": "10283819"
    }
  ]
}
```

```java
// The DashScope Java SDK version must be 2.21.4 or later.

import java.util.Arrays;
import java.util.Collections;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.exception.UploadFileException;
import com.alibaba.dashscope.common.ResponseFormat;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    
    // The following is If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
    static {
        Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";
    }
    public static void simpleMultiModalConversationCall()
            throws ApiException, NoApiKeyException, UploadFileException {
        MultiModalConversation conv = new MultiModalConversation();
        MultiModalMessage systemMessage = MultiModalMessage.builder().role(Role.SYSTEM.getValue())
                .content(Arrays.asList(
                        Collections.singletonMap("text", "You are a helpful assistant."))).build();
        MultiModalMessage userMessage = MultiModalMessage.builder().role(Role.USER.getValue())
                .content(Arrays.asList(
                        Collections.singletonMap("image", "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"),
                        Collections.singletonMap("text", "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (as an array, including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."))).build();
        ResponseFormat jsonMode = ResponseFormat.builder().type("json_object").build();
        MultiModalConversationParam param = MultiModalConversationParam.builder()
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen3-vl-plus")
                .messages(Arrays.asList(systemMessage, userMessage))
                .responseFormat(jsonMode)
                .build();
        MultiModalConversationResult result = conv.call(param);
        System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent().get(0).get("text"));
    }
    public static void main(String[] args) {
        try {
            simpleMultiModalConversationCall();
        } catch (ApiException | NoApiKeyException | UploadFileException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

### **Return result**

```json
{
  "ticket": [
    {
      "travel_date": "2013-06-29",
      "trains": "Serial Number",
      "seat_num": "371",
      "arrival_site": "Development Zone",
      "price": "8.00"
    }
  ],
  "invoice": [
    {
      "invoice_code": "221021325353",
      "invoice_number": "10283819"
    }
  ]
}
```

```bash
# ======= Important =======
# Different regions use separate API keys. To get an API key, see https://www.alibabacloud.com/help/en/model-studio/get-api-key
# If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===

curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H 'Content-Type: application/json' -d '{
    "model": "qwen3-vl-plus",
    "input": {
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "text": "You are a helpful assistant."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "image": "http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/demo_ocr/receipt_zh_demo.jpg"
                    },
                    {
                        "text": "Extract the ticket information (array type, including travel_date, trains, seat_num, arrival_site, and price) and the invoice information (as an array, including invoice_code and invoice_number) from the image. Output a JSON object that contains the ticket and invoice arrays."
                    }
                ]
            }
        ]
    },
    "parameters": {
        "response_format": {
            "type": "json_object"
        }
    }
}'
```

### **Return result**

```json
{
  "output": {
    "choices": [
      {
        "message": {
          "content": [
            {
              "text": {
                  "ticket": [
                    {
                      "travel_date": "2013-06-29",
                      "trains": "Serial Number",
                      "seat_num": "371",
                      "arrival_site": "Development Zone",
                      "price": "8.00"
                    }
                  ],
                  "invoice": [
                    {
                      "invoice_code": "221021325353",
                      "invoice_number": "10283819"
                    }
                  ]
                }
            }
          ],
          "role": "assistant"
        },
        "finish_reason": "stop"
      }
    ]
  },
  "usage": {
    "total_tokens": 598,
    "input_tokens_details": {
      "image_tokens": 418,
      "text_tokens": 68
    },
    "output_tokens": 112,
    "input_tokens": 486,
    "output_tokens_details": {
      "text_tokens": 112
    },
    "image_tokens": 418
  },
  "request_id": "b129dce1-0d5d-4772-b8b5-bd3a1d5cde63"
}
```

**Optimize prompts**
--------------------

Vague prompts, such as "return user information," can cause the model to generate unexpected results. To avoid this, describe the expected schema in your prompt. Include field types, whether a field is required, format requirements such as date formats, and provide examples.

OpenAI compatible

DashScope

Python

Node.js

```py
from openai import OpenAI
import os
import json
import textwrap  # Used to handle the indentation of multi-line strings and improve code readability.

# Predefine example responses to show the model the expected output format.
# Example 1: A complete response that includes a hobby.
example1_response = json.dumps(
    {
        "info": {"name": "John Doe", "age": "25 years old", "email": "johndoe@example.com"},
        "hobby": ["singing"]
    },
    ensure_ascii=False
)
# Example 2: A response that includes multiple hobbies.
example2_response = json.dumps(
    {
        "info": {"name": "Jane Smith", "age": "30 years old", "email": "janesmith@example.com"},
        "hobby": ["dancing", "swimming"]
    },
    ensure_ascii=False
)
# Example 3: A response that does not include the hobby field (hobby is optional).
example3_response = json.dumps(
    {
        "info": {"name": "Peter Jones", "age": "28 years old", "email": "peterjones@example.com"}
    },
    ensure_ascii=False
)
# Example 4: A response that does not include the hobby field.
example4_response = json.dumps(
    {
        "info": {"name": "Emily White", "age": "35 years old", "email": "emilywhite@example.com"}
    },
    ensure_ascii=False
)

# Initialize the OpenAI client and configure the API key and base URL.
client = OpenAI(
    # The Different regions use separate API keys. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    #  If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# The dedent function removes common leading whitespace from every line in a string. 
# This lets you indent strings neatly in your code, and the extra spaces will not be included at runtime.
system_prompt = textwrap.dedent(f"""
  Extract personal information from the user input and output it in the specified JSON Schema format:

    [Output Format Requirements]
    The output must strictly follow the JSON structure below:
    {{
      "info": {{
        "name": "String. Required. The name.",
        "age": "String. Required. The format is 'number years old', for example, '25 years old'.",
        "email": "String. Required. A standard email format, for example, 'user@example.com'."
      }},
      "hobby": ["Array of strings. Optional. Contains all of the hobbies. If no hobbies are mentioned, this field must be omitted from the output."]
    }}

    [Field Extraction Rules]
    1. name: Identify the name from the text. This field is required.
    2. age: Identify the age information and convert it to the 'number years old' format. This field is required.
    3. email: Identify the email address and keep its original format. This field is required.
    4. hobby: Identify the hobbies and output them as an array of strings. If no hobbies are mentioned, omit the hobby field entirely.

    [Reference Examples]
    Example 1 (includes a hobby):
    Q: My name is John Doe, I'm 25 years old, my email is johndoe@example.com, and I like to sing.
    A: {example1_response}

    Example 2 (includes multiple hobbies):
    Q: My name is Jane Smith, I'm 30 years old, my email is janesmith@example.com, and I enjoy dancing and swimming.
    A: {example2_response}

    Example 3 (does not include hobbies):
    Q: My name is Peter Jones, I'm 28 years old, and my email is peterjones@example.com.
    A: {example3_response}

    Example 4 (does not include hobbies):
    Q: I'm Emily White, 35 years old. My email is emilywhite@example.com.
    A: {example4_response}

    Strictly follow the format and rules above to extract information and output the JSON. If the user does not mention any hobbies, do not include the hobby field in the output.
  """
)

# Call the LLM API to extract information.
completion = client.chat.completions.create(
    model="qwen-plus",  # Specify the model to use, which is qwen-plus.
    messages=[
        {
            "role": "system",
            "content": system_prompt  # Use the system prompt defined above.
        },
        {
            "role": "user",
            "content": "Hi everyone, my name is Alex Brown. I'm 34 years old, my email is alexbrown@example.com, and I like to play basketball and travel.", 
        },
    ],
    response_format={"type": "json_object"},  # Specify the response format as JSON to ensure structured output.
)

# Extract and print the JSON result generated by the model.
json_string = completion.choices[0].message.content
print(json_string)
```

### **Return result**

```json
{
  "info": {
    "name": "Alex Brown",
    "age": "34",
    "email": "alexbrown@example.com"
  },
  "hobby": ["basketball", "travel"]  
}
```

```ts
import OpenAI from "openai";

// Predefine example responses to show the model the expected output format.
// Example 1: A complete response that contains all fields.
const example1Response = JSON.stringify({
    info: { name: "John Doe", age: "25 years old", email: "johndoe@example.com" },
    hobby: ["singing"]
}, null, 2);

// Example 2: A response that contains multiple hobbies.
const example2Response = JSON.stringify({
    info: { name: "Jane Smith", age: "30 years old", email: "janesmith@example.com" },
    hobby: ["dancing", "swimming"]
}, null, 2);

// Example 3: A response without the hobby field. The hobby field is optional.
const example3Response = JSON.stringify({
    info: { name: "Peter Jones", age: "28 years old", email: "peterjones@example.com" }
}, null, 2);

// Example 4: Another response without the hobby field.
const example4Response = JSON.stringify({
    info: { name: "Emily White", age: "35 years old", email: "emilywhite@example.com" }
}, null, 2);

// Initialize the OpenAI client configuration.
const openai = new OpenAI({
    // The Different regions use separate API keys.
    // If the environment variable is not configured, replace the following line with your Alibaba Cloud Model Studio API key: apiKey: "sk-xxx",
    apiKey: process.env.DASHSCOPE_API_KEY,
    //  If you use a model in the Beijing region, replace the URL with: https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
});

// Create a chat completion request. Use a structured prompt to improve output accuracy.
const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
        {
            role: "system",
            content: `Please extract personal information from the user input and output it in the specified JSON Schema format.

[Output Format Requirements]
The output must strictly follow the JSON structure below:
{
  "info": {
    "name": "String type, required field, name",
    "age": "String type, required field, format: '[number] years old', for example, '25 years old'",
    "email": "String type, required field, standard email format, for example, 'user@example.com'"
  },
  "hobby": ["String array type, optional. Contains all user hobbies. Omit this field if no hobbies are mentioned."]
}

[Field Extraction Rules]
1. name: Identify the name from the text and extract it. This field is required.
2. age: Identify the age information, convert it to the '[number] years old' format, and extract it. This field is required.
3. email: Identify the email address, keep its original format, and extract it. This field is required.
4. hobby: Identify the hobbies and output them as a string array. If no hobby information is mentioned, omit the hobby field entirely from the output.

[Reference Examples]
Example 1 (with a hobby):
Q: My name is John Doe, I am 25 years old, my email is johndoe@example.com, and my hobby is singing.
A: ${example1Response}

Example 2 (with multiple hobbies):
Q: My name is Jane Smith, I am 30 years old, my email is janesmith@example.com, and I usually like dancing and swimming.
A: ${example2Response}

Example 3 (without a hobby):
Q: My name is Peter Jones, I am 28 years old, and my email is peterjones@example.com.
A: ${example3Response}

Example 4 (without a hobby):
Q: I am Emily White, 35 years old, and my email is emilywhite@example.com.
A: ${example4Response}

Please strictly follow the preceding format and rules to extract information and output the JSON. If the user does not mention any hobbies, do not include the hobby field in the output.`
        },
        {
            role: "user",
            content: "Hello everyone, my name is Alex Brown, I am 34 years old, my email is alexbrown@example.com, and I usually like to play basketball and travel."
        }
    ],
    response_format: {
        type: "json_object"
    }
});

// Extract and print the JSON result generated by the model.
const jsonString = completion.choices[0].message.content;
console.log(jsonString);
```

### **Return result**

```json
{
  "info": {
    "name": "Alex Brown",
    "age": "34 years old",
    "email": "alexbrown@example.com"
  },
  "hobby": [
    "Playing basketball",
    "Traveling"
  ]
}
```

Python

Java

```py
import os
import json
import dashscope
#  If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

# Predefine example responses to show the model the expected output format.
example1_response = json.dumps(
    {
        "info": {"name": "John Doe", "age": "25 years old", "email": "johndoe@example.com"},
        "hobby": ["singing"]
    },
    ensure_ascii=False
)
example2_response = json.dumps(
    {
        "info": {"name": "Jane Smith", "age": "30 years old", "email": "janesmith@example.com"},
        "hobby": ["dancing", "swimming"]
    },
    ensure_ascii=False
)
example3_response = json.dumps(
    {
        "info": {"name": "Peter Jones", "age": "40 years old", "email": "peterjones@example.com"},
        "hobby": ["Rap", "basketball"]
    },
    ensure_ascii=False
)

messages=[
        {
            "role": "system",
            "content": f"""Please extract personal information from the user input and output it in the specified JSON Schema format:

[Output Format Requirements]
The output must strictly follow the JSON structure below:
{{
  "info": {{
    "name": "string, required, the name",
    "age": "string, required, in the format of 'number years old', for example, '25 years old'",
    "email": "string, required, in the standard email format, for example, 'user@example.com'"
  }},
  "hobby": ["string array, optional, contains all of the hobbies. If no hobbies are mentioned, omit this field entirely."]
}}

[Field Extraction Rules]
1. name: Identify the name from the text. This field is required.
2. age: Identify the age information and convert it to the "number years old" format. This field is required.
3. email: Identify the email address and keep its original format. This field is required.
4. hobby: Identify the hobbies and output them as a string array. If no hobby information is mentioned, omit the hobby field entirely.

[Reference Examples]
Example 1 (includes a hobby):
Q: My name is John Doe, I am 25 years old, my email is johndoe@example.com, and my hobby is singing.
A: {example1_response}

Example 2 (includes multiple hobbies):
Q: My name is Jane Smith, I am 30 years old, my email is janesmith@example.com, and I like dancing and swimming.
A: {example2_response}

Example 3 (includes multiple hobbies):
Q: My email is peterjones@example.com, I am 40 years old, my name is Peter Jones, and I can rap and play basketball.
A: {example3_response}

Please strictly follow the preceding format and rules to extract information and output the JSON. If the user does not mention any hobbies, do not include the hobby field in the output."""
        },
        {
            "role": "user",
            "content": "Hello everyone, my name is Alex Brown, I am 34 years old, my email is alexbrown@example.com, and I like to play basketball and travel.", 
        },
    ]
response = dashscope.Generation.call(
    # If you use a model in the China (Beijing) region, you must use an API key for the China (Beijing) region. Get it at: https://bailian.console.alibabacloud.com/?tab=model#/api-key
    # If the environment variable is not configured, replace the following line with your Alibaba Cloud Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv('DASHSCOPE_API_KEY'),
    model="qwen-plus", 
    messages=messages,
    result_format='message',
    response_format={'type': 'json_object'}
    )
json_string = response.output.choices[0].message.content
print(json_string)
```

### **Return result**

```json
{
  "info": {
    "name": "Alex Brown",
    "age": "34 years old",
    "email": "alexbrown@example.com"
  },
  "hobby": [
    "Playing basketball",
    "Traveling"
  ]
}
```

```java
import java.util.Arrays;
import java.lang.System;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.common.ResponseFormat;
import com.alibaba.dashscope.protocol.Protocol;

public class Main {
    public static GenerationResult callWithMessage() throws ApiException, NoApiKeyException, InputRequiredException {
        //  If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1
        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
        Message systemMsg = Message.builder()
                .role(Role.SYSTEM.getValue())
                .content("""
                Extract personal information from the user input and output it in the specified JSON schema format:

[Output Format Requirements]
The output must strictly follow this JSON structure:
{
  "info": {
    "name": "String, required, name",
    "age": "String, required, format is 'number + years old', for example, '25 years old'",
    "email": "String, required, standard email format, for example, 'user@example.com'"
  },
  "hobby": ["String array, optional, contains all user hobbies. If not mentioned, do not include this field in the output."]
}

[Field Extraction Rules]
1. name: Identify the name from the text. This is a required field.
2. age: Identify the age and convert it to the 'number + years old' format. This is a required field.
3. email: Identify the email address and keep its original format. This is a required field.
4. hobby: Identify user hobbies and output them as a string array. If no hobbies are mentioned, omit the hobby field entirely.

[Reference Examples]
Example 1 (with a hobby):
Q: My name is John Doe, I am 25 years old, my email is johndoe@example.com, and my hobby is singing.
A:{"info":{"name":"John Doe","age":"25 years old","email":"johndoe@example.com"},"hobby":["singing"]}

Example 2 (with multiple hobbies):
Q: My name is Jane Smith, I am 30 years old, my email is janesmith@example.com, and I like to dance and swim.
A:{"info":{"name":"Jane Smith","age":"30 years old","email":"janesmith@example.com"},"hobby":["dancing","swimming"]}

Example 3 (without hobbies):
Q: My name is David Wilson, my email is davidwilson@example.com, and I am 40 years old.
A:{"info":{"name":"David Wilson","age":"40 years old","email":"davidwilson@example.com"}}""")
                .build();
        Message userMsg = Message.builder()
                .role(Role.USER.getValue())
                .content("Hello everyone, my name is Alex Brown, I am 34 years old, my email is alexbrown@example.com, and I enjoy playing basketball and traveling.")
                .build();
        ResponseFormat jsonMode = ResponseFormat.builder().type("json_object").build();
        GenerationParam param = GenerationParam.builder()
                // If you use a model in the China (Beijing) region, you must use an API key for that region. To get an API key, visit https://bailian.console.alibabacloud.com/?tab=model#/api-key
                // If you have not configured the environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .messages(Arrays.asList(systemMsg, userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .responseFormat(jsonMode)
                .build();
        return gen.call(param);
    }
    public static void main(String[] args) {
        try {
            GenerationResult result = callWithMessage();
            System.out.println(result.getOutput().getChoices().get(0).getMessage().getContent());
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            // Use a logging framework to record the exception information.
            System.err.println("An error occurred while calling the generation service: " + e.getMessage());
        }
    }
}
```

### **Return result**

```json
{
  "info": {
    "name": "Alex Brown",
    "age": "34",
    "email": "alexbrown@example.com"
  },
  "hobby": [
    "Playing basketball",
    "Traveling"
  ]
}
```

**Get output in a specified format**
------------------------------------

In simple scenarios, setting the
`response_format`
`type`
to
`json_object`
returns a standard JSON string, but the structure of the content might not meet your expectations. For complex scenarios that require strict type constraints, such as automated parsing and API interoperability, set the
`type`
to
`json_schema`
to force the model to output content that strictly conforms to a specified format. The format and an example of
`response_format`
are shown below:

| **Format** | **Example** |
| --- | --- |

|  |  |
| --- | --- |
| **Format** | **Example** |
| ``` {   "type": "json_schema",   "json_schema": {     "name": "schema_name",       // Name of the schema     "strict": true,              // Recommended to set to true for strict format compliance     "schema": {       "type": "object",       "properties": {...},       // Defines the field structure, see the example on the right       "required": [...],         // List of required fields       "additionalProperties": false  // Recommended to set to false to output only defined fields     }   } } ``` | ``` {   "type": "json_schema",   "json_schema": {     "name": "user_info",     "strict": true,     "schema": {       "type": "object",       "properties": {         "name": {           "type": "string",           "description": "User name"         },         "age": {           "type": "integer",           "description": "User age"         },         "email": {           "type": "string",           "description": "Email address"         }       },       "required": ["name", "age"],       "additionalProperties": false     }   } } ``` |

The example above forces the model to output a JSON object that includes the two required fields,
`name`
and
`age`
, and the optional
`email`
field.

### **Getting started**

The OpenAI SDK's
`parse`
method lets you directly pass a Python Pydantic class or a Node.js Zod object. The SDK automatically converts it into a JSON Schema, so you do not need to manually write complex JSON. For the DashScope SDK, manually construct the JSON Schema by following the format described above.

OpenAI compatible

DashScope

Python

Node.js


Python

```py
from pydantic import BaseModel, Field
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

class UserInfo(BaseModel):
    name: str = Field(description="The name")
    age: int = Field(description="The age, in years")

completion = client.chat.completions.parse(
    model="qwen-plus",
    messages=[
        {"role": "system", "content": "Extract the name and age information."},
        {"role": "user", "content": "My name is John Doe, and I am 25 years old."},
    ],
    response_format=UserInfo,
)

result = completion.choices[0].message.parsed
print(f"Name: {result.name}, Age: {result.age}")
```


Node.js

```ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI(
    {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

const UserInfo = z.object({
  name: z.string().describe("The name"),
  age: z.number().int().describe("The age in years"),
});

const completion = await openai.chat.completions.parse({
  model: "qwen-plus",
  messages: [
    { role: "system", content: "Extract the name and age information." },
    { role: "user", content: "My name is Alex Brown, and I am 25 years old." },
  ],
  response_format: zodResponseFormat(UserInfo, "user_info"),
});

const userInfo = completion.choices[0].message.parsed;
console.log(`Name: ${userInfo.name}`);
console.log(`Age: ${userInfo.age}`);
```

Running the code produces the following output:

```
Name: Alex Brown, Age: 25
```

> The Java SDK is not currently supported.

Python


Python

```py
import os
import dashscope
import json

messages = [
    {
        "role": "user",
        "content": "My name is Alex Brown, and I am 25 years old.",
    },
]
response = dashscope.Generation.call(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
    messages=messages,
    result_format="message",
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "properties": {
                    "name": {"title": "Name", "type": "string"},
                    "age": {"title": "Age", "type": "integer"},
                },
                "required": ["name", "age"],
                "title": "UserInfo",
                "type": "object",
            },
        },
    },
)
json_object = json.loads(response.output.choices[0].message.content)
print(f"Name: {json_object['name']}, Age: {json_object['age']}")
```

Running the code produces the following output:

```
Name: Alex Brown, Age: 25
```

### Configuration guide

When using JSON Schema, follow these guidelines to obtain more reliable structured output:

* **Declare required fields**

  List required fields in the
  `required`
  array. Optional fields can be omitted from this list. For example:

  ```json
  {
    "properties": {
      "name": {"type": "string"},
      "age": {"type": "integer"},
      "email": {"type": "string"}
    },
    "required": ["name", "age"]
  }
  ```

  If the input does not provide email information, the output will not include this field.
* **Implement optional fields**

  In addition to omitting a field from the
  `required`
  array, you can also make it optional by allowing a
  `null`
  type:

  ```json
  {
    "properties": {
      "name": {"type": "string"},
      "email": {"type": ["string", "null"]}  // Can be a string or null
    },
    "required": ["name", "email"]  // Both are in the required list
  }
  ```

  The output will always include the
  `email`
  field, but its value might be
  `null`
  .
* **Configure additionalProperties**

  This setting controls whether the output can include extra fields that are not defined in the schema:

  ```json
  {
    "properties": {"name": {"type": "string"}},
    "required": ["name"],
    "additionalProperties": true  // Allows extra fields
  }
  ```

  For example, an input of
  `"I am John Doe, 25 years old"`
  generates the output
  `{"name": "John Doe", "age": 25}`
  . This output includes the
  `age`
  field, which is not explicitly defined in the input.

  | **Value** | **Behavior** | **Scenario** |
  | --- | --- | --- |

  |  |  |  |
  | --- | --- | --- |
  | **Value** | **Behavior** | **Scenario** |
  | `false` | Outputs only defined fields | When you need to precisely control the structure |
  | `true` | Allows extra fields | When you need to capture more information |
* **Supported data types:**
  string, number, integer, boolean, object, array, and enum.

**Going live**
--------------

* **Validation**

  If you use JSON Object mode, validate the output with a tool before passing it to downstream applications. You can use tools such as jsonschema (Python), Ajv (JavaScript), or Everit (Java). This ensures that the output complies with the specified JSON Schema and prevents parsing failures, data loss, or business logic interruptions caused by missing fields, type errors, or incorrect formats. If a failure occurs, you can use strategies such as retries or prompting the LLM to fix the output.
* **Disable**
  `max_tokens`

  Do not specify
  `max_tokens`
  (a parameter that controls the number of output tokens and defaults to the model's maximum output limit) when you enable structured output. Otherwise, the returned JSON string may be incomplete and cause parsing failures for downstream services.
* **Use SDKs to help generate schemas**

  Use an SDK to automatically generate the schema. This helps avoid errors from manual maintenance and enables automatic validation and parsing.

  Python

  Node.js


  Python

  ```py
  from pydantic import BaseModel, Field
  from typing import Optional
  from openai import OpenAI
  import os

  client = OpenAI(
      api_key=os.getenv("DASHSCOPE_API_KEY"),
      base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
  )
  class UserInfo(BaseModel):
      name: str = Field(description="User name")
      age: int = Field(description="User age")
      email: Optional[str] = None  # Optional field

  completion = client.chat.completions.parse(
      model="qwen-plus",
      messages=[
          {"role": "system", "content": "Extract the name and age information."},
          {"role": "user", "content": "My name is Alex Brown, and I am 25 years old."},
      ],
      response_format=UserInfo  # Directly pass the Pydantic model
  )

  result = completion.choices[0].message.parsed  # Type-safe parsed result
  print(f"Name: {result.name}, Age: {result.age}")
  ```


  Node.js

  ```ts
  import { z } from "zod";
  import { zodResponseFormat } from "openai/helpers/zod";
  import OpenAI from "openai";

  const client = new OpenAI(
      {
          apiKey: process.env.DASHSCOPE_API_KEY,
          baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
      }
  );

  const UserInfo = z.object({
    name: z.string().describe("User name"),
    age: z.number().int().describe("User age"),
    email: z.string().optional().nullable()  // Optional field
  });

  const completion = await client.chat.completions.parse({
    model: "qwen-plus",
    messages: [
      { role: "system", content: "Extract the name and age information." },
      { role: "user", content: "My name is Alex Brown, and I am 25 years old." },
    ],
    response_format: zodResponseFormat(UserInfo, "user_info")
  });

  console.log(completion.choices[0].message.parsed);
  ```

**FAQ**
-------

### **Q: How do Qwen models produce structured output in thinking mode?**

A: Qwen's thinking mode does not currently support structured output. To obtain a standard JSON string in thinking mode, you can use a model that supports JSON mode to fix the output if JSON parsing fails.

1. **Obtain output in thinking mode**

   Call a model in thinking mode to obtain high-quality output, which may not be a standard JSON string.

   > When you enable thinking mode, do not set the
   > `response_format`
   > parameter to
   > `{"type": "json_object"}`
   > . Otherwise, an error occurs.

   ```py
   completion = client.chat.completions.create(
       model="qwen-plus",
       messages=[
           {"role": "system", "content": system_prompt},
           {
               "role": "user",
               "content": "Hello everyone, my name is Alex Brown. I am 34 years old, my email is alexbrown@example.com, and I enjoy playing basketball and traveling.",
           },
       ],
       # Enable thinking mode. Do not set the response_format parameter to {"type": "json_object"}, or an error will occur.
       extra_body={"enable_thinking": True},
       # Enable streaming output for thinking mode.
       stream=True
   )
   # Extract and print the JSON result generated by the model.
   json_string = ""
   for chunk in completion:
       if chunk.choices[0].delta.content is not None:
           json_string += chunk.choices[0].delta.content
   ```
2. **Validate and fix the output**

   Try to parse the
   `json_string`
   from the previous step:

   * If the model generates a standard JSON string, you can parse and return it directly.
   * If the model generates a non-standard JSON string, you can call a model that supports structured output to fix the format. We recommend choosing a fast and cost-effective model, such as qwen-flash in non-thinking mode.

   ```py
   import json
   from openai import OpenAI
   import os

   # Initialize the OpenAI client (if the client variable has not been defined in the previous code block, uncomment the line below)
   # client = OpenAI(
   #     api_key=os.getenv("DASHSCOPE_API_KEY"),
   #     base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
   # )

   try:
       json_object_from_thinking_model = json.loads(json_string)
       print("A standard JSON string was generated.")
   except json.JSONDecodeError:
       print("A non-standard JSON string was generated. Fixing it with a model that supports structured output.")
       completion = client.chat.completions.create(
           model="qwen-flash",
           messages=[
               {
                   "role": "system",
                   "content": "You are an expert in fixing JSON formats. Please fix the JSON string entered by the user to the standard format.",
               },
               {
                   "role": "user",
                   "content": json_string,
               },
           ],
           response_format={"type": "json_object"},
       )
       json_object_from_thinking_model = json.loads(completion.choices[0].message.content)
   ```

Error codes
-----------

If the model call fails and returns an error message, see
[Error messages](https://modelstudio.console.alibabacloud.com/help/en/model-studio/error-code)
for resolution.
