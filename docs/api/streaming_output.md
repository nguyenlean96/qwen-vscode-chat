In applications such as real-time chat or long text generation, long wait times can degrade the user experience and trigger server-side timeouts that cause task failures. Streaming output solves these two problems by continuously returning chunks of text as the model generates them.

**How it works**
----------------

Streaming output is based on the Server-Sent Events (SSE) protocol. After you make a streaming request, the server establishes an HTTP persistent connection with the client. Each time the model generates a text block, also known as a chunk, it immediately pushes the chunk through the connection. After all the content is generated, the server sends an end signal.

The client listens to the event stream, receiving and processing chunks in real time, such as rendering text character-by-character in the interface. This contrasts with non-streaming calls, which return all content at once.

Who are you?

Waiting ...

I am Qwen, an AI assistant developed by Alibaba Cloud. I can answer questions, provide information, and have conversations with you. How can I assist you?

⏱️
Output time: 3 seconds

Stream Enabled

> For reference only. No requests are actually sent.

> This component is for reference only. No requests are actually sent.

**Billing**
-----------

The billing rules for streaming output are the same as for non-streaming calls. Billing is based on the number of input and output tokens in the request.

If a request is interrupted, you are billed only for the output tokens generated before the server receives the stop request.

**How to use**
--------------

**Important**

Some models only support streaming calls: the open-source version of Qwen3, the commercial and open-source versions of QwQ, QVQ, and Qwen-Omni.

### **Step 1: Set the API key and select a region**

You need to
[create and configure an API key](https://modelstudio.console.alibabacloud.com/help/en/model-studio/get-api-key)
and
[export it as an environment variable](https://modelstudio.console.alibabacloud.com/help/en/model-studio/configure-api-key-through-environment-variables)
.

> Setting the API key as an environment variable (
> `DASHSCOPE_API_KEY`
> ) is more secure than hard-coding it in your code.

### **Step 2: Make a streaming request**

OpenAI compatible

DashScope

* **How to enable**

  Set the
  `stream`
  parameter to
  `true`
  .
* **View token usage**

  By default, the OpenAI protocol does not return token usage. To include token usage information in the
  **final data block**
  , set
  `stream_options={"include_usage": true}`
  .

Python

Node.js

curl

```py
import os
from openai import OpenAI

# 1. Preparation: Initialize the client.
client = OpenAI(
    # We recommend configuring the API key as an environment variable to avoid hard coding.
    api_key=os.environ["DASHSCOPE_API_KEY"],
    # API keys are region-specific. Make sure the base_url matches the region of your API key.
    # If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

# 2. Make a streaming request.
completion = client.chat.completions.create(
    model="qwen-plus",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Introduce yourself."}
    ],
    stream=True,
    stream_options={"include_usage": True}
)

# 3. Process the streaming response.
# Storing response chunks in a list and then joining them is more efficient than repeatedly concatenating strings.
content_parts = []
print("AI: ", end="", flush=True)

for chunk in completion:
    if chunk.choices:
        content = chunk.choices[0].delta.content or ""
        print(content, end="", flush=True)
        content_parts.append(content)
    elif chunk.usage:
        print("
--- Request Usage ---")
        print(f"Input Tokens: {chunk.usage.prompt_tokens}")
        print(f"Output Tokens: {chunk.usage.completion_tokens}")
        print(f"Total Tokens: {chunk.usage.total_tokens}")

full_response = "".join(content_parts)
# print(f"
--- Full Response ---
{full_response}")
```

### **Return result**

```
AI: Hello! I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, and scripts, perform logical reasoning, write code, express opinions, and play games. I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish. If you have any questions or need help, feel free to let me know!
--- Request Usage ---
Input Tokens: 26
Output Tokens: 87
Total Tokens: 113
```

```ts
import OpenAI from "openai";

async function main() {
    // 1. Preparation: Initialize the client.
    // We recommend configuring the API key as an environment variable to avoid hard coding.
    if (!process.env.DASHSCOPE_API_KEY) {
        throw new Error("Set the DASHSCOPE_API_KEY environment variable.");
    }
    // API keys are region-specific. Make sure the baseURL matches the region of your API key.
    // If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    const client = new OpenAI({
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });

    try {
        // 2. Make a streaming request.
        const stream = await client.chat.completions.create({
            model: "qwen-plus",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Introduce yourself." },
            ],
            stream: true,
            // Purpose: Get the token usage for this request from the last chunk.
            stream_options: { include_usage: true },
        });

        // 3. Process the streaming response.
        const contentParts = [];
        process.stdout.write("AI: ");
        
        for await (const chunk of stream) {
            // The last chunk does not contain choices, but it contains usage information.
            if (chunk.choices && chunk.choices.length > 0) {
                const content = chunk.choices[0]?.delta?.content || "";
                process.stdout.write(content);
                contentParts.push(content);
            } else if (chunk.usage) {
                // The request is complete. Print the token usage.
                console.log("
--- Request Usage ---");
                console.log(`Input Tokens: ${chunk.usage.prompt_tokens}`);
                console.log(`Output Tokens: ${chunk.usage.completion_tokens}`);
                console.log(`Total Tokens: ${chunk.usage.total_tokens}`);
            }
        }
        
        const fullResponse = contentParts.join("");
        // console.log(`
--- Full Response ---
${fullResponse}`);

    } catch (error) {
        console.error("Request failed:", error);
    }
}

main();
```

### **Results**

```
AI: Hello! I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text such as stories, official documents, emails, and scripts, perform logical reasoning, write code, express opinions, and play games. I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish. If you have any questions or need help, feel free to ask me at any time!
--- Request Usage ---
Input Tokens: 26
Output Tokens: 89
Total Tokens: 115
```

### **Request**

```bash
# ======= Important =======
# Make sure the DASHSCOPE_API_KEY environment variable is set.
# API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
# If you use a model in the China (Beijing) region, replace the base URL with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# === Delete this comment before execution ===

curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" --no-buffer -d '{
    "model": "qwen-plus",
    "messages": [
        {"role": "user", "content": "Who are you?"}
    ],
    "stream": true,
    "stream_options": {"include_usage": true}
}'
```

### **Response**

The returned data is a streaming response that follows the SSE protocol. Each line that starts with
`data:`
represents a data block.

```
data: {"choices":[{"delta":{"content":"","role":"assistant"},"index":0,"logprobs":null,"finish_reason":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"finish_reason":null,"delta":{"content":"I am"},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"delta":{"content":" a"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"delta":{"content":" large-scale"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"delta":{"content":" language model from Alibaba"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"delta":{"content":" Cloud, and my name is Qwen"},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"delta":{"content":"."},"finish_reason":null,"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[{"finish_reason":"stop","delta":{"content":""},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: {"choices":[],"object":"chat.completion.chunk","usage":{"prompt_tokens":22,"completion_tokens":17,"total_tokens":39},"created":1726132850,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-428b414f-fdd4-94c6-b179-8f576ad653a8"}

data: [DONE]
```

* `data:`
  : The data payload of the message, which is usually a JSON-formatted string.
* `[DONE]`
  : Indicates that the entire streaming response has ended.

* **How to enable**

  Depending on the method you use (Python SDK, Java SDK, or cURL):

  + Python SDK: Set the
    `stream`
    parameter to
    `True`
    .
  + Java SDK: Call the service using the
    `streamCall`
    interface.
  + cURL: Set the header parameter
    `X-DashScope-SSE`
    to
    `enable`
    .
* **Incremental output**

  The DashScope protocol supports both incremental and non-incremental streaming output.

  + **Incremental**

    (Recommended):
    Each data chunk contains only the newly generated content. To enable incremental streaming, set
    `incremental_output`
    to
    `true`
    .

    > Example: ["I love", "to eat", "apples"]
  + **Non-incremental**
    : Each data chunk contains all previously generated content. This wastes network bandwidth and increases the processing load on the client. To enable non-incremental streaming, set
    `incremental_output`
    to
    `false`
    .

    > Example: ["I ", "I like ", "I like apples"]
* **View token usage**

  Each data block includes real-time token usage information.

Python

Java

curl

```py
import os
from http import HTTPStatus
import dashscope
from dashscope import Generation

# 1. Preparation: Configure the API key and region.
# We recommend configuring the API key as an environment variable to avoid hard coding.
try:
    dashscope.api_key = os.environ["DASHSCOPE_API_KEY"]
except KeyError:
    raise ValueError("Set the DASHSCOPE_API_KEY environment variable.")

# API keys are region-specific. Make sure the base_url matches the region of your API key.
# If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1"

# 2. Make a streaming request.
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Introduce yourself."},
]

try:
    responses = Generation.call(
        model="qwen-plus",
        messages=messages,
        result_format="message",
        stream=True,
        # Key: Set to True to get incremental output for better performance.
        incremental_output=True,
    )

    # 3. Process the streaming response.
    content_parts = []
    print("AI: ", end="", flush=True)

    for resp in responses:
        if resp.status_code == HTTPStatus.OK:
            content = resp.output.choices[0].message.content
            print(content, end="", flush=True)
            content_parts.append(content)

            # Check if this is the last packet.
            if resp.output.choices[0].finish_reason == "stop":
                usage = resp.usage
                print("
--- Request Usage ---")
                print(f"Input Tokens: {usage.input_tokens}")
                print(f"Output Tokens: {usage.output_tokens}")
                print(f"Total Tokens: {usage.total_tokens}")
        else:
            # Handle errors.
            print(
                f"
Request failed: request_id={resp.request_id}, code={resp.code}, message={resp.message}"
            )
            break

    full_response = "".join(content_parts)
    # print(f"
--- Full Response ---
{full_response}")

except Exception as e:
    print(f"An unknown error occurred: {e}")
```

**Sample response**

```
AI: Hello! I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can help you answer questions and create text such as stories, official documents, emails, and scripts, perform logical reasoning, write code, express opinions, and play games. I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish. If you have any questions or need help, feel free to ask me at any time!
--- Request Usage ---
Input Tokens: 26
Output Tokens: 91
Total Tokens: 117
```

```java
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;

import java.util.Arrays;
import java.util.concurrent.CountDownLatch;
import com.alibaba.dashscope.protocol.Protocol;

public class Main {
    public static void main(String[] args) {
        // 1. Get the API key.
        String apiKey = System.getenv("DASHSCOPE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("Set the DASHSCOPE_API_KEY environment variable.");
            return;
        }

        // 2. Initialize the Generation instance.
        // API keys are region-specific. Make sure the baseUrl matches the region of your API key.
        // If you use a model in the China (Beijing) region, replace the baseUrl with: https://dashscope.aliyuncs.com/api/v1
        Generation gen = new Generation(Protocol.HTTP.getValue(), "https://dashscope-intl.aliyuncs.com/api/v1");
        CountDownLatch latch = new CountDownLatch(1);

        // 3. Build the request parameters.
        GenerationParam param = GenerationParam.builder()
                .apiKey(apiKey)
                .model("qwen-plus")
                .messages(Arrays.asList(
                        Message.builder()
                                .role(Role.USER.getValue())
                                .content("Introduce yourself.")
                                .build()
                ))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .incrementalOutput(true) // Enable incremental output for streaming.
                .build();
        // 4. Make a streaming call and process the response.
        try {
            Flowable<GenerationResult> result = gen.streamCall(param);
            StringBuilder fullContent = new StringBuilder();
            System.out.print("AI: ");
            result
                    .subscribeOn(Schedulers.io()) // The request is executed on an I/O thread.
                    .observeOn(Schedulers.computation()) // The response is processed on a computation thread.
                    .subscribe(
                            // onNext: Process each response chunk.
                            message -> {
                                String content = message.getOutput().getChoices().get(0).getMessage().getContent();
                                String finishReason = message.getOutput().getChoices().get(0).getFinishReason();
                                // Output the content.
                                System.out.print(content);
                                fullContent.append(content);
                                // When finishReason is not null, it indicates the last chunk. Output the usage information.
                                if (finishReason != null && !"null".equals(finishReason)) {
                                    System.out.println("
--- Request Usage ---");
                                    System.out.println("Input Tokens: " + message.getUsage().getInputTokens());
                                    System.out.println("Output Tokens: " + message.getUsage().getOutputTokens());
                                    System.out.println("Total Tokens: " + message.getUsage().getTotalTokens());
                                }
                                System.out.flush(); // Immediately flush the output.
                            },
                            // onError: Handle errors.
                            error -> {
                                System.err.println("
Request failed: " + error.getMessage());
                                latch.countDown();
                            },
                            // onComplete: Callback for completion.
                            () -> {
                                System.out.println(); // New line.
                                // System.out.println("Full response: " + fullContent.toString());
                                latch.countDown();
                            }
                    );
            // The main thread waits for the asynchronous task to complete.
            latch.await();
            System.out.println("Program execution finished.");
        } catch (Exception e) {
            System.err.println("Request exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

### **Return value**

```
AI: Hello! I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can help you answer questions and create text such as stories, official documents, emails, and scripts, perform logical reasoning, write code, express opinions, and play games. I support multiple languages, including but not limited to Chinese, English, German, French, and Spanish. If you have any questions or need help, feel free to ask me at any time!
--- Request Usage ---
Input Tokens: 26
Output Tokens: 91
Total Tokens: 117
```

### **Request**

```bash
# ======= Important =======
# Make sure the DASHSCOPE_API_KEY environment variable is set.
# API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
# If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===
curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -H "X-DashScope-SSE: enable" -d '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters": {
        "result_format": "message",
        "incremental_output":true
    }
}'
```

### **Response**

The response follows the SSE format. Each message includes the following:

* id: The data block number.
* event: The event type, which is always result.
* HTTP status code information.
* data: The JSON-formatted data payload.

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"I am","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":27,"output_tokens":1,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" Qwen","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":30,"output_tokens":4,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}

id:3
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":", an Alibaba","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":33,"output_tokens":7,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}

...


id:13
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" or need help, feel free to","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":90,"output_tokens":64,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}

id:14
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" ask me!","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":92,"output_tokens":66,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}

id:15
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","role":"assistant"},"finish_reason":"stop"}]},"usage":{"total_tokens":92,"output_tokens":66,"input_tokens":26,"prompt_tokens_details":{"cached_tokens":0}},"request_id":"d30a9914-ac97-9102-b746-ce0cb35e3fa2"}
```

**For multimodal models**
-------------------------

**Note**

* This section applies to the Qwen-VL, Qwen-VL-OCR, Kimi-K2.5, Qwen3-Omni-Captioner models.
* Qwen-Omni supports
  **only streaming output**
  . Because its output can contain multimodal content such as
  **text**
  or
  **audio**
  , the logic for parsing the returned results differs from other models. For more information, see
  [Omni-modal](https://modelstudio.console.alibabacloud.com/help/en/model-studio/qwen-omni#76b04b353ds7i)
  .

Multimodal models allow you to add content, such as images and audio, to conversations. The implementation of streaming output for these models differs from text models in the following ways:

* **Construction of the user message**
  : The input for multimodal models includes multimodal content, such as images and audio, in addition to text.
* **DashScope SDK interface:**
  When using the DashScope Python SDK, you can call the MultiModalConversation interface. When using the DashScope Java SDK, you can call the MultiModalConversation class.

OpenAI compatible

DashScope

Python

Node.js

curl

```py
from openai import OpenAI
import os

client = OpenAI(
    # API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

completion = client.chat.completions.create(
    model="qwen3-vl-plus",  # You can replace this with other multimodal models and modify the messages accordingly.
    messages=[
        {"role": "user",
        "content": [{"type": "image_url",
                    "image_url": {"url": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"},},
                    {"type": "text", "text": "What scene is depicted in the image?"}]}],
    stream=True,
  # stream_options={"include_usage": True}
)
full_content = ""
print("Streaming output content:")
for chunk in completion:
    # If stream_options.include_usage is True, the choices field of the last chunk is an empty list and should be skipped. You can get the token usage from chunk.usage.
    if chunk.choices and chunk.choices[0].delta.content != "":
        full_content += chunk.choices[0].delta.content
        print(chunk.choices[0].delta.content)
print(f"Full content: {full_content}")
```

```ts
import OpenAI from "openai";

const openai = new OpenAI(
    {
        // API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
        // If you have not configured an environment variable, replace the following line with your Model Studio API key: apiKey: "sk-xxx"
        apiKey: process.env.DASHSCOPE_API_KEY,
        // If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/compatible-mode/v1
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);

const completion = await openai.chat.completions.create({
    model: "qwen3-vl-plus",  //  You can replace this with other multimodal models and modify the messages accordingly.
    messages: [
        {role: "user",
        content: [{"type": "image_url",
                    "image_url": {"url": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"},},
                    {"type": "text", "text": "What scene is depicted in the image?"}]}],
    stream: true,
    // stream_options: { include_usage: true },
});

let fullContent = ""
console.log("Streaming output content:")
for await (const chunk of completion) {
    // If stream_options.include_usage is true, the choices field of the last chunk is an empty array and should be skipped. You can get the token usage from chunk.usage.
    if (chunk.choices[0] && chunk.choices[0].delta.content != null) {
      fullContent += chunk.choices[0].delta.content;
      console.log(chunk.choices[0].delta.content);
    }
}
console.log(`Full output content: ${fullContent}`)
```

```bash
# ======= Important =======
# If you use a model in the China (Beijing) region, replace the base URL with: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
# === Delete this comment before execution ===

curl --location 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions' --header "Authorization: Bearer $DASHSCOPE_API_KEY" --header 'Content-Type: application/json' --data '{
    "model": "qwen3-vl-plus",
    "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"
          }
        },
        {
          "type": "text",
          "text": "What scene is depicted in the image?"
        }
      ]
    }
  ],
    "stream":true,
    "stream_options":{"include_usage":true}
}'
```

Python

Java

curl

```py
import os
from dashscope import MultiModalConversation
import dashscope
# If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

messages = [
    {
        "role": "user",
        "content": [
            {"image": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"},
            {"text": "What scene is depicted in the image?"}
        ]
    }
]

responses = MultiModalConversation.call(
    # API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key="sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model='qwen3-vl-plus',  #  You can replace this with other multimodal models and modify the messages accordingly.
    messages=messages,
    stream=True,
    incremental_output=True)
    
full_content = ""
print("Streaming output content:")
for response in responses:
    if response["output"]["choices"][0]["message"].content:
        print(response.output.choices[0].message.content[0]['text'])
        full_content += response.output.choices[0].message.content[0]['text']
print(f"Full content: {full_content}")
```

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversation;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationParam;
import com.alibaba.dashscope.aigc.multimodalconversation.MultiModalConversationResult;
import com.alibaba.dashscope.common.MultiModalMessage;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.exception.UploadFileException;
import io.reactivex.Flowable;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    static {
        // If you use a model in the China (Beijing) region, replace the base_url with: https://dashscope.aliyuncs.com/api/v1
        Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";
    }
    public static void streamCall()
            throws ApiException, NoApiKeyException, UploadFileException {
        MultiModalConversation conv = new MultiModalConversation();
        // must create mutable map.
        MultiModalMessage userMessage = MultiModalMessage.builder().role(Role.USER.getValue())
                .content(Arrays.asList(Collections.singletonMap("image", "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"),
                        Collections.singletonMap("text", "What scene is depicted in the image?"))).build();
        MultiModalConversationParam param = MultiModalConversationParam.builder()
                // API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen3-vl-plus")  //  You can replace this with other multimodal models and modify the messages accordingly.
                .messages(Arrays.asList(userMessage))
                .incrementalOutput(true)
                .build();
        Flowable<MultiModalConversationResult> result = conv.streamCall(param);
        result.blockingForEach(item -> {
            try {
                List<Map<String, Object>> content = item.getOutput().getChoices().get(0).getMessage().getContent();
                    // Check if content exists and is not empty.
                if (content != null &&  !content.isEmpty()) {
                    System.out.println(content.get(0).get("text"));
                    }
            } catch (Exception e){
                System.exit(0);
            }
        });
    }

    public static void main(String[] args) {
        try {
            streamCall();
        } catch (ApiException | NoApiKeyException | UploadFileException e) {
            System.out.println(e.getMessage());
        }
        System.exit(0);
    }
}
```

```bash
# ======= Important =======
# API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
# If you use a model in the China (Beijing) region, replace the base URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
# === Delete this comment before execution ===

curl -X POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H 'Content-Type: application/json' -H 'X-DashScope-SSE: enable' -d '{
    "model": "qwen3-vl-plus",
    "input":{
        "messages":[
            {
                "role": "user",
                "content": [
                    {"image": "https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg"},
                    {"text": "What scene is depicted in the image?"}
                ]
            }
        ]
    },
    "parameters": {
        "incremental_output": true
    }
}'
```

**For thinking models**
-----------------------

A thinking model first returns
`reasoning_content`
(the thinking process), followed by
`content`
(the response). You can determine whether the model is in the thinking or response stage based on the data packet status.

> For more information about thinking models, see
> [Deep thinking](https://modelstudio.console.alibabacloud.com/help/en/model-studio/deep-thinking)
> ,
> [Visual understanding](https://modelstudio.console.alibabacloud.com/help/en/model-studio/vision)
> , and
> [Visual reasoning](https://modelstudio.console.alibabacloud.com/help/en/model-studio/visual-reasoning)
> .

> To implement streaming output for Qwen3-Omni-Flash (thinking mode), see
> [Omni-modal](https://modelstudio.console.alibabacloud.com/help/en/model-studio/qwen-omni#76b04b353ds7i)
> .

OpenAI compatible

DashScope

The following shows the response format when you use the OpenAI Python SDK to call the qwen-plus model in thinking mode with streaming output:

```
# Thinking phase
...
ChoiceDelta(content=None, function_call=None, refusal=None, role=None, tool_calls=None, reasoning_content='Cover all key points while')
ChoiceDelta(content=None, function_call=None, refusal=None, role=None, tool_calls=None, reasoning_content='being natural and fluent.')
# Responding phase
ChoiceDelta(content='Hello! I am **Q', function_call=None, refusal=None, role=None, tool_calls=None, reasoning_content=None)
ChoiceDelta(content='wen** (', function_call=None, refusal=None, role=None, tool_calls=None, reasoning_content=None)
...
```

* If
  `reasoning_content`
  is not None and
  `content`
  is
  `None`
  , the model is in the thinking stage.
* If
  `reasoning_content`
  is None and
  `content`
  is not
  `None`
  , the model is in the response stage.
* If both are
  `None`
  , the stage is the same as that of the previous packet.

Python

Node.js

HTTP

### **Sample code**

```py
from openai import OpenAI
import os

# Initialize the OpenAI client.
client = OpenAI(
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key="sk-xxx"
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

messages = [{"role": "user", "content": "Who are you?"}]

completion = client.chat.completions.create(
    model="qwen-plus",  # You can replace this with other deep thinking models as needed.
    messages=messages,
    # The enable_thinking parameter enables the thinking process. This parameter is not supported for the qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, and QwQ models.
    extra_body={"enable_thinking": True},
    stream=True,
    # stream_options={
    #     "include_usage": True
    # },
)

reasoning_content = ""  # Full thinking process
answer_content = ""  # Full response
is_answering = False  # Whether the responding phase has started
print("
" + "=" * 20 + "Thinking process" + "=" * 20 + "
")

for chunk in completion:
    if not chunk.choices:
        print("
Usage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect only the thinking content.
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is not None:
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # Received content, start responding.
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("
" + "=" * 20 + "Full response" + "=" * 20 + "
")
            is_answering = True
        print(delta.content, end="", flush=True)
        answer_content += delta.content
```

### **Return result**

```
====================Thinking process====================

Okay, the user is asking "Who are you?". I need to provide an accurate and friendly answer. First, I must confirm my identity: Qwen, developed by the Tongyi Lab at Alibaba Group. Next, I should explain my main functions, such as answering questions, creating text, and logical reasoning. I need to maintain a friendly tone and avoid being too technical to make the user feel at ease. I should also avoid complex jargon to keep the answer simple and clear. Additionally, I might add some interactive elements, inviting the user to ask more questions to encourage further conversation. Finally, I'll check if I've missed any important information, such as my Chinese name "Tongyi Qianwen" and English name "Qwen", and my parent company and lab. I need to ensure the answer is comprehensive and meets the user's expectations.
====================Full response====================

Hello! I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can answer questions, create text, perform logical reasoning, write code, and more, all to provide users with high-quality information and services. You can call me Qwen, or just Tongyi Qianwen. How can I help you?
```

### **Sample code**

```ts
import OpenAI from "openai";
import process from 'process';

// Initialize the OpenAI client.
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY, // Read from an environment variable
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

let reasoningContent = '';
let answerContent = '';
let isAnswering = false;

async function main() {
    try {
        const messages = [{ role: 'user', content: 'Who are you?' }];
        const stream = await openai.chat.completions.create({
            // You can replace this with other Qwen3 or QwQ models as needed.
            model: 'qwen-plus',
            messages,
            stream: true,
            // The enable_thinking parameter enables the thinking process. This parameter is not supported for the qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, and QwQ models.
            enable_thinking: true
        });
        console.log('
' + '='.repeat(20) + 'Thinking process' + '='.repeat(20) + '
');

        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log('
Usage:');
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0].delta;
            
            // Collect only the thinking content.
            if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
                if (!isAnswering) {
                    process.stdout.write(delta.reasoning_content);
                }
                reasoningContent += delta.reasoning_content;
            }

            // Start replying after content is received.
            if (delta.content !== undefined && delta.content) {
                if (!isAnswering) {
                    console.log('
' + '='.repeat(20) + 'Full response' + '='.repeat(20) + '
');
                    isAnswering = true;
                }
                process.stdout.write(delta.content);
                answerContent += delta.content;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

### **Return result**

```
====================Thinking process====================

Okay, the user is asking "Who are you?". I need to answer with my identity. First, I should clearly state that I am Qwen, a large-scale language model developed by Alibaba Cloud. Next, I can mention my main functions, such as answering questions, creating text, and logical reasoning. I should also emphasize my multilingual support, including Chinese and English, so the user knows I can handle requests in different languages. Additionally, I might need to explain my application scenarios, such as helping with study, work, and daily life. However, the user's question is quite direct, so I should keep it concise. I also need to ensure a friendly tone and invite the user to ask further questions. I will check for any missing important information, such as my version or latest updates, but the user probably doesn't need that level of detail. Finally, I will confirm the answer is accurate and free of errors.
====================Full response====================

I am Qwen, a large-scale language model developed by the Tongyi Lab at Alibaba Group. I can perform various tasks such as answering questions, creating text, logical reasoning, and coding. I support multiple languages, including Chinese and English. If you have any questions or need help, feel free to let me know!
```

### **Sample code**

curl

For Qwen3 open-source models, set
`enable_thinking`
to
`true`
to enable the thinking mode. The
`enable_thinking`
parameter has no effect on the qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, QwQ, models.

```bash
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "user", 
            "content": "Who are you?"
        }
    ],
    "stream": true,
    "stream_options": {
        "include_usage": true
    },
    "enable_thinking": true
}'
```

### **Return result**

```
data: {"choices":[{"delta":{"content":null,"role":"assistant","reasoning_content":""},"index":0,"logprobs":null,"finish_reason":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

.....

data: {"choices":[{"finish_reason":"stop","delta":{"content":"","reasoning_content":null},"index":0,"logprobs":null}],"object":"chat.completion.chunk","usage":null,"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: {"choices":[],"object":"chat.completion.chunk","usage":{"prompt_tokens":10,"completion_tokens":360,"total_tokens":370},"created":1745485391,"system_fingerprint":null,"model":"qwen-plus","id":"chatcmpl-e2edaf2c-8aaf-9e54-90e2-b21dd5045503"}

data: [DONE]
```

The following shows the data format when you use the DashScope Python SDK to call the qwen-plus model in thinking mode:

```
# Thinking phase
...
{"role": "assistant", "content": "", "reasoning_content": "informative, "}
{"role": "assistant", "content": "", "reasoning_content": "so the user finds it helpful."}
# Responding phase
{"role": "assistant", "content": "I am Qwen", "reasoning_content": ""}
{"role": "assistant", "content": ", developed by Tongyi Lab", "reasoning_content": ""}
...
```

* If
  `reasoning_content`
  is not an empty string and
  `content`
  is an empty string, the model is in the thinking stage.
* If
  `reasoning_content`
  is an empty string and
  `content`
  is not an empty string, the model is in the response stage.
* If both are empty strings, the stage is the same as that of the previous packet.

Python

Java

HTTP

### **Sample code**

```py
import os
from dashscope import Generation
import dashscope
dashscope.base_http_api_url = "https://dashscope-intl.aliyuncs.com/api/v1/"

messages = [{"role": "user", "content": "Who are you?"}]

completion = Generation.call(
    # If you have not configured an environment variable, replace the following line with your Model Studio API key: api_key = "sk-xxx",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    # You can replace this with other deep thinking models as needed.
    model="qwen-plus",
    messages=messages,
    result_format="message", # Open-source Qwen3 models only support "message". For a better experience, we recommend you set this parameter to "message" for other models as well.
    # Enable deep thinking. This parameter has no effect on the qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, and QwQ models.
    enable_thinking=True,
    stream=True,
    incremental_output=True, # Open-source Qwen3 models only support true. For a better experience, we recommend you set this parameter to true for other models as well.
)

# Define the complete thinking process.
reasoning_content = ""
# Define the complete response.
answer_content = ""
# Determine whether the thinking process is complete and the response is being generated.
is_answering = False

print("=" * 20 + "Thinking process" + "=" * 20)

for chunk in completion:
    # If both the thinking process and the response are empty, do nothing.
    if (
        chunk.output.choices[0].message.content == ""
        and chunk.output.choices[0].message.reasoning_content == ""
    ):
        pass
    else:
        # If the current part is the thinking process.
        if (
            chunk.output.choices[0].message.reasoning_content != ""
            and chunk.output.choices[0].message.content == ""
        ):
            print(chunk.output.choices[0].message.reasoning_content, end="", flush=True)
            reasoning_content += chunk.output.choices[0].message.reasoning_content
        # If the current part is the response.
        elif chunk.output.choices[0].message.content != "":
            if not is_answering:
                print("
" + "=" * 20 + "Full response" + "=" * 20)
                is_answering = True
            print(chunk.output.choices[0].message.content, end="", flush=True)
            answer_content += chunk.output.choices[0].message.content

# To print the complete thinking process and response, uncomment and run the following code.
# print("=" * 20 + "Full thinking process" + "=" * 20 + "
")
# print(f"{reasoning_content}")
# print("=" * 20 + "Full response" + "=" * 20 + "
")
# print(f"{answer_content}")
```

### **Return result**

```
====================Thinking process====================
Okay, the user is asking, "Who are you?" I need to answer this question. First, I must clarify my identity: Qwen, a large-scale language model developed by Alibaba Cloud. Next, I should explain my functions and purposes, such as answering questions, creating text, and logical reasoning. I should also emphasize my goal of being a helpful assistant to users, providing help and support.

When responding, I should maintain a conversational tone and avoid using technical jargon or complex sentence structures. I can use friendly expressions, like "Hello there! ~", to make the conversation more natural. I also need to ensure the information is accurate and does not omit key points, such as my developer, main functions, and application scenarios.

I should also consider potential follow-up questions from the user, such as specific application examples or technical details. So, I can subtly set up opportunities in my answer to guide the user to ask more questions. For example, by mentioning, "Whether it's a question about daily life or a professional field, I can do my best to help," which is both comprehensive and open-ended.

Finally, I will check if the response is fluent, without repetition or redundancy, ensuring it is concise and clear. I will also maintain a balance between being friendly and professional, so the user feels that I am both approachable and reliable.
====================Full response====================
Hello there! ~ I am Qwen, a large-scale language model developed by Alibaba Cloud. I can answer questions, create text, perform logical reasoning, write code, and more, all to provide help and support to users. Whether it's a question about daily life or a professional field, I can do my best to help. How can I assist you?
```

### **Sample code**

```java
// dashscope SDK version >= 2.19.4
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;
import java.lang.System;
import com.alibaba.dashscope.utils.Constants;

public class Main {
    static {
        Constants.baseHttpApiUrl="https://dashscope-intl.aliyuncs.com/api/v1";
    }
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static StringBuilder reasoningContent = new StringBuilder();
    private static StringBuilder finalContent = new StringBuilder();
    private static boolean isFirstPrint = true;

    private static void handleGenerationResult(GenerationResult message) {
        String reasoning = message.getOutput().getChoices().get(0).getMessage().getReasoningContent();
        String content = message.getOutput().getChoices().get(0).getMessage().getContent();

        if (!reasoning.isEmpty()) {
            reasoningContent.append(reasoning);
            if (isFirstPrint) {
                System.out.println("====================Thinking process====================");
                isFirstPrint = false;
            }
            System.out.print(reasoning);
        }

        if (!content.isEmpty()) {
            finalContent.append(content);
            if (!isFirstPrint) {
                System.out.println("
====================Full response====================");
                isFirstPrint = true;
            }
            System.out.print(content);
        }
    }
    private static GenerationParam buildGenerationParam(Message userMsg) {
        return GenerationParam.builder()
                // If you have not configured an environment variable, replace the following line with your Model Studio API key: .apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("qwen-plus")
                .enableThinking(true)
                .incrementalOutput(true)
                .resultFormat("message")
                .messages(Arrays.asList(userMsg))
                .build();
    }
    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }

    public static void main(String[] args) {
        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("Who are you?").build();
            streamCallWithMessage(gen, userMsg);
//             Print the final result.
//            if (reasoningContent.length() > 0) {
//                System.out.println("
====================Full response====================");
//                System.out.println(finalContent.toString());
//            }
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}
```

### **Return result**

```
====================Thinking process====================
Okay, the user is asking "Who are you?". I need to answer based on my previous settings. First, my role is Qwen, a large-scale language model from Alibaba Group. I need to keep my language conversational, simple, and easy to understand.

The user might be new to me or wants to confirm my identity. I should first directly answer who I am, then briefly explain my functions and uses, such as answering questions, creating text, and coding. I also need to mention my multilingual support so the user knows I can handle requests in different languages.

Also, according to the guidelines, I need to maintain a human-like personality, so my tone should be friendly, and I might use emojis to add a touch of warmth. I might also need to guide the user to ask further questions or use my functions, for example, by asking them what they need help with.

I need to be careful not to use complex jargon and avoid being long-winded. I will check for any missed key points, such as multilingual support and specific capabilities. I will ensure the answer meets all requirements, including being conversational and concise.
====================Full response====================
Hello! I am Qwen, a large-scale language model from Alibaba Group. I can answer questions, create text such as stories, official documents, emails, and scripts, perform logical reasoning, write code, express opinions, and play games. I am proficient in multiple languages, including but not limited to Chinese, English, German, French, and Spanish. Is there anything I can help you with?
```

### **Sample code**

curl

For hybrid thinking models, set
`enable_thinking`
to
`true`
to enable the thinking mode. The
`enable_thinking`
parameter has no effect on the qwen3-30b-a3b-thinking-2507, qwen3-235b-a22b-thinking-2507, QwQ, models.

```bash
# ======= Important =======
# API keys for different regions are different. To obtain an API key, visit: https://www.alibabacloud.com/help/en/model-studio/get-api-key
# If you use a model in the China (Beijing) region, replace the URL with: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# === Delete this comment before execution ===
curl -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation" -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -H "X-DashScope-SSE: enable" -d '{
    "model": "qwen-plus",
    "input":{
        "messages":[      
            {
                "role": "user",
                "content": "Who are you?"
            }
        ]
    },
    "parameters":{
        "enable_thinking": true,
        "incremental_output": true,
        "result_format": "message"
    }
}'
```

### **Return Value**

```
id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"Hmm","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":14,"input_tokens":11,"output_tokens":3},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:2
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":",","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":15,"input_tokens":11,"output_tokens":4},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:3
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" the user","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":16,"input_tokens":11,"output_tokens":5},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:4
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" is asking","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":17,"input_tokens":11,"output_tokens":6},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:5
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":" '","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":18,"input_tokens":11,"output_tokens":7},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
......

id:358
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" help","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":373,"input_tokens":11,"output_tokens":362},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:359
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":",","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":374,"input_tokens":11,"output_tokens":363},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:360
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" feel free to","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":375,"input_tokens":11,"output_tokens":364},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:361
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" let me","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":376,"input_tokens":11,"output_tokens":365},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:362
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":" know","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":377,"input_tokens":11,"output_tokens":366},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:363
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"!","reasoning_content":"","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}

id:364
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"","reasoning_content":"","role":"assistant"},"finish_reason":"stop"}]},"usage":{"total_tokens":378,"input_tokens":11,"output_tokens":367},"request_id":"25d58c29-c47b-9e8d-a0f1-d6c309ec58b1"}
```

**Going live**
--------------

* **Performance and resource management**
  : In a backend service, maintaining an HTTP persistent connection for each streaming request consumes resources. Ensure that your service is configured with an appropriate connection pool size and timeout period. In high-concurrency scenarios, monitor the service's file descriptor usage to prevent exhaustion.
* **Client-side rendering**
  : On the web frontend, use the
  `ReadableStream`
  and
  `TextDecoderStream`
  APIs to smoothly process and render SSE event streams for an optimal user experience.
* [Model monitoring](https://modelstudio.console.alibabacloud.com/help/en/model-studio/model-telemetry/)
  :

  + **Key metrics**
    : Monitor
    **time to first token (TTFT)**
    , the core metric for measuring the streaming experience, along with the API error rate and average response time.
  + **Alerting settings**
    : Set alerts for abnormal API error rates, especially for 4xx and 5xx errors.
* **Nginx proxy configuration**
  : If you use Nginx as a reverse proxy, its default output buffering (proxy\_buffering) disrupts real-time streaming responses. To ensure data is pushed to the client immediately, set
  `proxy_buffering off`
  in the Nginx configuration file to disable this feature.

Error codes
-----------

If a call fails, see
[Error messages](https://modelstudio.console.alibabacloud.com/help/en/model-studio/error-code)
for troubleshooting.

**FAQ**
-------

### **Q: Why does the returned data not include usage information?**

A: By default, the OpenAI protocol does not return usage information. You can set the
`stream_options`
parameter to include usage information in the final packet.

### **Q: Does streaming output affect the model's response quality?**

A: No, it does not. However, some models only support streaming output, and non-streaming output may cause timeout errors. We recommend using streaming output.
