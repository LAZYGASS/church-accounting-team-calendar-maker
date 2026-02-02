import calendar
from datetime import datetime

# Verify January 2026 dates
print("January 2026 verification:")
print(f"8일 (집행일) = {calendar.day_name[calendar.weekday(2026, 1, 8)]}")
print(f"3일 (결재일, 8일-5일) = {calendar.day_name[calendar.weekday(2026, 1, 3)]}")
print(f"22일 (집행일) = {calendar.day_name[calendar.weekday(2026, 1, 22)]}")  
print(f"17일 (결재일, 22일-5일) = {calendar.day_name[calendar.weekday(2026, 1, 17)]}")

# Show full calendar
print("\n" + "="*50)
print(calendar.month(2026, 1))
