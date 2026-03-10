import OpenAI, { APIPromise } from 'openai';
import { Stream } from 'openai/core/streaming.js';

const ALIBABACLOUD_MODEL_SITE = "https://modelstudio.console.alibabacloud.com/";


const API_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const CODING_API_BASE_URL = 'https://coding-intl.dashscope.aliyuncs.com/v1';

const ENDPOINTS = [
  API_BASE_URL,
  CODING_API_BASE_URL,
];

export interface FailedAttemptUrl {url: string; last_try: Date; error: string};

export class QwenClient {
  private _workingEndpointIndex: number = 0;
  private _failedEndpoints: Array<FailedAttemptUrl> = [];
  private _client: OpenAI;
  
  /**
   * Creates a new QwenClient instance.
   * @param apiKey The API key for authentication
   * @param lastUsedUrl Optional URL of the last used endpoint for continuity
   */
  constructor(
    private readonly apiKey: string,
    lastUsedUrl: string | undefined = undefined
  ) {
    if (!lastUsedUrl) {
      const lastUsedUrlIndex = ENDPOINTS.indexOf(lastUsedUrl ?? '');
      if (lastUsedUrlIndex !== -1) {
        this._workingEndpointIndex = lastUsedUrlIndex;
      }
    }
    this._client = this.initialize();
  }

  /**
   * Creates a streaming chat completion request
   * @param requestBody The request body containing model, messages, tools, and stream options
   * @returns A promise that resolves to a stream of chat completion chunks
   */
  stream(
    requestBody: {
      model: string;
      messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
      tools?: {
        type: "function";
        function: {
          name: string;
          description: string;
          parameters: object;
        };
      }[];
      stream_options?: {
        include_usage?: boolean,
      },
    }
  ):
    APIPromise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
      _request_id?: string | null;
    }>
  {
    return this._client!.chat.completions.create(
      {
        model: requestBody.model,
        messages: requestBody.messages,
        stream: true, // Stream enabled by default
      }, {
        body: {
          ...requestBody,
          stream: true,
          enable_thinking: true,
        },
      }
    );
  }
  
  /**
   * Initializes the OpenAI client with the current endpoint
   * @returns A configured OpenAI client instance
   */
  private initialize(): OpenAI {
    return new OpenAI({
      apiKey: this.apiKey,
      baseURL: ENDPOINTS[this._workingEndpointIndex],
    });
  }

  /**
   * Records a failed endpoint attempt
   * @param error_msg The error message from the failed attempt
   */
  throwEndpointException(error_msg: string): void {
    this._failedEndpoints.push({
      url: ENDPOINTS[this._workingEndpointIndex],
      error: error_msg,
      last_try: new Date(),
    });
  }
  
  /**
   * Endpoints rotation is handled by getNextUrl()
   */
  rotate(): void {
    /**
     * This check whether the number of errors is equal to the number of API available
     * which means all API endpoints threw error for the given API Key + selected model.
     */
    if (this._failedEndpoints.length === ENDPOINTS.length) {
      throw Error(`No API endpoints match the given API key nor selected models. See more at: ${ALIBABACLOUD_MODEL_SITE}`)
    }
    this._workingEndpointIndex = (this._workingEndpointIndex + 1) % ENDPOINTS.length;
    this._client = this._client.withOptions({baseURL: ENDPOINTS[this._workingEndpointIndex]});
  }
  
  /**
   * Gets the current working endpoint URL
   * @returns The URL of the current endpoint
   */
  getUrl(): string {
    return ENDPOINTS[this._workingEndpointIndex];
  }
}