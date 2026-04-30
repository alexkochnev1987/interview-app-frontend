export type BrowserSpeechRecognitionResultAlternative = {
  transcript: string;
};

export type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: BrowserSpeechRecognitionResultAlternative;
};

export type BrowserSpeechRecognitionResultList = {
  length: number;
  [index: number]: BrowserSpeechRecognitionResult;
};

export type BrowserSpeechRecognitionEvent = Event & {
  results: BrowserSpeechRecognitionResultList;
  resultIndex: number;
};

export type BrowserSpeechRecognitionErrorEvent = Event & {
  error?: string;
  message?: string;
};

export type BrowserSpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance;

export type BrowserWindowWithSpeechRecognition = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};
