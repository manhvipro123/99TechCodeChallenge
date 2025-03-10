import axios from "axios";

// Định nghĩa kiểu dữ liệu cho tỷ giá coin
export interface PriceData {
  currency: string;
  price: number;
}

// Hàm lấy tỷ giá từ API
export const fetchExchangeRates = async (): Promise<PriceData[] | null> => {
  try {
    const response = await axios.get<PriceData[]>(
      "https://interview.switcheo.com/prices.json"
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tỷ giá:", error);
    return null;
  }
};