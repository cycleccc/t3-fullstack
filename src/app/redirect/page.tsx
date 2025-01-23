"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      // 解码 URL 编码的字符串
      const decodedData = decodeURIComponent(location.search).replace(
        "?data=",
        "",
      );
      // 解析 JSON 字符串
      interface ParsedData {
        info: {
          token: string;
          user_id: string;
          avatar: string;
          real_name: string;
        };
      }

      const parsedData = JSON.parse(decodedData) as ParsedData;

      // 从 parsedData 中提取用户数据
      const { token, user_id, avatar, real_name } = parsedData?.info;

      if (token) {
        // 使用 js-cookie 保存数据到 Cookie
        Cookies.set("auth_token", token);
        Cookies.set("user_id", user_id);
        Cookies.set("user_avatar", avatar);
        Cookies.set("user_real_name", real_name);

        // 跳转到首页或上一次访问的页面
        router.push("/");
      } else {
        console.error("Token 不存在");
        router.push("/");
      }
    } catch (error) {
      console.error("解析 data 参数失败:", error);
      router.push("/");
    }
  }, [router]);

  return <p>正在跳转中...</p>;
}
