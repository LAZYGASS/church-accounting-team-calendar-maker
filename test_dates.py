from ppt_template_generator import BudgetCalendarTemplate

# Test January 2026
schedule = BudgetCalendarTemplate.calculate_schedule(2026, 1)
print("1월 2026 일정:")
print(f"  예산집행일 (둘째주/넷째주 목요일): {schedule['execution_days']}")
print(f"  결재일 (전주 토요일): {schedule['approval_days']}")
print(f"  운영위원회의 (마지막주 전주 일요일): {schedule['committee_day']}")

# Verify dates
import calendar
print("\n날짜 확인:")
for day in schedule['execution_days']:
    weekday = calendar.day_name[calendar.weekday(2026, 1, day)]
    print(f"  {day}일 = {weekday}")
