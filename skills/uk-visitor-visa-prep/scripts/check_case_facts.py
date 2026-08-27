#!/usr/bin/env python3
"""Validate core dates and funding arithmetic in a Case_Facts.json file."""

from __future__ import annotations

import argparse
import json
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any


def nested(data: dict[str, Any], dotted: str) -> Any:
    value: Any = data
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            raise KeyError(dotted)
        value = value[part]
    return value


def money(data: dict[str, Any], dotted: str) -> tuple[Decimal, str]:
    value = nested(data, dotted)
    if not isinstance(value, dict) or "amount" not in value or not value.get("currency"):
        raise ValueError(f"{dotted} must contain amount and currency")
    try:
        amount = Decimal(str(value["amount"]))
    except InvalidOperation as exc:
        raise ValueError(f"{dotted}.amount is not numeric") from exc
    return amount, str(value["currency"]).upper()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("facts", type=Path)
    args = parser.parse_args()

    data = json.loads(args.facts.read_text(encoding="utf-8"))
    errors: list[str] = []
    warnings: list[str] = []

    try:
        arrival = date.fromisoformat(str(nested(data, "trip.arrival_date")))
        departure = date.fromisoformat(str(nested(data, "trip.departure_date")))
        if arrival >= departure:
            errors.append("trip.arrival_date must be before trip.departure_date")
    except (KeyError, ValueError) as exc:
        errors.append(f"invalid trip dates: {exc}")

    try:
        total, total_currency = money(data, "trip.estimated_total")
        applicant, applicant_currency = money(data, "funding.applicant_contribution")
        sponsor, sponsor_currency = money(data, "funding.sponsor_contribution")
        currencies = {total_currency, applicant_currency, sponsor_currency}
        if len(currencies) != 1:
            warnings.append("funding uses multiple currencies; document the conversion source and date")
        elif applicant + sponsor != total:
            errors.append("applicant_contribution + sponsor_contribution does not equal estimated_total")
    except (KeyError, ValueError) as exc:
        errors.append(f"invalid funding values: {exc}")

    for path in ("applicant.full_name", "trip.purpose"):
        try:
            if not str(nested(data, path)).strip():
                errors.append(f"{path} must not be empty")
        except KeyError:
            errors.append(f"missing required field: {path}")

    result = {"valid": not errors, "errors": errors, "warnings": warnings}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
