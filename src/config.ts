// 设备参数配置
export interface KeyInfo {
    key?: ArrayBuffer;
    keyver?: number;
}

export interface DeviceConfig {
    install_id: string;
    device_id: string;
    device_type?: string;
    device_brand?: string;
    key_info?: KeyInfo;
}

/**
 * 共享密钥（16 字节）。
 * ⚠️ 占位值，使用者需自行填入。
 */
export const shared_key: ArrayBuffer = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]).buffer;

export const defaultConfig: DeviceConfig = {
    install_id: "your_install_id_here",
    device_id: "your_device_id_here",
    device_type: "your_device_type",
    device_brand: "your_device_brand",
};