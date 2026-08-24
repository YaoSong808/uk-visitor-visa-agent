import { ApplicationData } from "./types";

export type LocalCheck = { code: string; message: string };

function numberFrom(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  return normalized ? Number(normalized) : 0;
}

export function runLocalChecks(data: ApplicationData): LocalCheck[] {
  const checks: LocalCheck[] = [];
  const arrival = data.trip.arrivalDate ? new Date(data.trip.arrivalDate) : null;
  const departure = data.trip.departureDate ? new Date(data.trip.departureDate) : null;
  const returnDate = data.ties.returnDate ? new Date(data.ties.returnDate) : null;
  const cost = numberFrom(data.finance.estimatedCost);
  const funds = numberFrom(data.finance.personalFunds) + numberFrom(data.finance.sponsorAmount);

  if (arrival && departure && departure <= arrival) checks.push({ code: "invalid-trip-dates", message: "离境日期必须晚于到达日期。" });
  if (departure && returnDate && returnDate < departure) checks.push({ code: "invalid-return-commitment", message: "回程约束日期早于英国离境日期。" });
  if (cost > 0 && funds > 0 && funds < cost) checks.push({ code: "funding-gap", message: "个人资金与资助金额合计低于预计旅行费用。" });
  if (data.finance.sponsorName && !data.finance.sponsorRelationship) checks.push({ code: "sponsor-relationship", message: "已填写资助人，但未说明与资助人的关系。" });
  if (data.finance.sponsorName && !data.finance.sponsorIncome) checks.push({ code: "sponsor-income", message: "资助人收入信息尚未填写。" });
  if (data.applicant.currentCountry && data.applicant.currentCountry.toLowerCase() !== "china" && !data.applicant.residenceExpiry) checks.push({ code: "residence-proof", message: "你可能在非国籍地申请，请补充当地合法居留身份及有效期。" });
  if (!data.trip.stops.some((stop) => stop.accommodation.trim())) checks.push({ code: "accommodation", message: "行程中尚未说明任何拟住宿酒店或区域。" });
  return checks;
}
