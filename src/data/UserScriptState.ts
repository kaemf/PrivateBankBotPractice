export type UserScriptState =
  | "WaitingForName"
  | "WaitingForPayment"
  | "AskingForPhoneNumber"
  | "FunctionRoot"
  | "EndFunctionManager"
  | "ValuesMenuHandlerAndRoot"