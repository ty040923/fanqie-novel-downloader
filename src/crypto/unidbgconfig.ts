// 签名配置
// ⚠️ 所有字段均为占位，使用者需自行填入实际值。

export interface UnidbgConfig {
    signKey: Uint8Array;
    aid: string;
    licenseId: string;
    sdkVersion: string;
    sdkVersionInt: number;
    callType: number;
}

export const defaultUnidbgConfig: UnidbgConfig = {
    signKey: new Uint8Array(32), // TODO: 替换为实际签名密钥
    aid: "your_aid_here",
    licenseId: "your_license_id_here",
    sdkVersion: "your_sdk_version_here",
    sdkVersionInt: 0,
    callType: 0,
};