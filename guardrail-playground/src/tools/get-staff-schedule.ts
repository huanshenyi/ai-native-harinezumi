import { tool } from "ai";
import z from "zod";

export const getStaffSchedule = tool({
  name: "getStaffSchedule",
  description: "Get staff schedule and availability for Hair Salon MIKA",
  inputSchema: z.object({
    date: z.string().describe("The date to check schedule (YYYY-MM-DD format)"),
    staffName: z
      .string()
      .optional()
      .describe("Optional: specific staff name to check"),
  }),
  execute: async ({ date, staffName }) => {
    const scheduleData: Record<
      string,
      Record<string, Record<string, { status: string; service?: string }>>
    > = {
      "2025-08-28": {
        田中美香: {
          "10:00-12:00": { status: "予約済", service: "カット+カラー" },
          "13:00-14:00": { status: "予約済", service: "カット" },
          "15:00-17:00": { status: "空き" },
          "17:00-19:00": { status: "予約済", service: "パーマ" },
        },
        佐藤裕子: {
          "10:00-11:00": { status: "予約済", service: "カット" },
          "12:00-13:30": { status: "予約済", service: "カラー" },
          "14:00-15:00": { status: "空き" },
          "15:30-16:15": { status: "予約済", service: "トリートメント" },
        },
      },
      "2025-08-29": {
        田中美香: {
          "10:00-11:00": { status: "空き" },
          "11:30-13:30": { status: "予約済", service: "カット+カラー" },
          "14:30-15:30": { status: "空き" },
          "16:00-17:00": { status: "予約済", service: "カット" },
        },
        佐藤裕子: {
          "10:00-12:00": { status: "予約済", service: "パーマ" },
          "13:00-14:00": { status: "空き" },
          "14:30-16:00": { status: "予約済", service: "カラー" },
          "16:30-18:00": { status: "空き" },
        },
      },
    };

    if (staffName) {
      return {
        date,
        staff: staffName,
        schedule: scheduleData[date]?.[staffName] || {},
      };
    }

    return {
      date,
      allStaff: scheduleData[date] || {},
    };
  },
});
