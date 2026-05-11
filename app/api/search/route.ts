import { NextResponse } from "next/server";
import { getSearchResults } from "./_lib/search";
import { Filters, SortOrder } from "../../_lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const suchtext = searchParams.get("suchtext")?.trim() || null;
  const fotografen = searchParams.get("fotografen")?.trim() || null;
  const restrictionsParam = searchParams.get("restrictions")?.trim();
  const restrictions = restrictionsParam ? restrictionsParam.split(",").map((r) => r.trim()) : null;
  const from = searchParams.get("from")?.trim() || null;
  const to = searchParams.get("to")?.trim() || null;
  const page = Number(searchParams.get("page") ?? "0");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const filters: Filters = {
    suchtext,
    fotografen,
    restrictions,
    datum:
      from || to
        ? {
            from: from ? new Date(from) : new Date("1900-01-01"),
            to: to ? new Date(to) : new Date("9999-12-31"),
          }
        : null,
  };

  const start = Date.now();
  const result = await getSearchResults({
    filters,
    page: Number.isNaN(page) ? 0 : page,
    pageSize: Number.isNaN(pageSize) || pageSize <= 0 ? 10 : pageSize,
    sortOrder,
  });
  const queryTimeMs = Date.now() - start;

  return NextResponse.json({ ...result, queryTimeMs });
}
