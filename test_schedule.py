from ppt_template_generator import BudgetCalendarTemplate
import calendar

# Test January 2026
schedule = BudgetCalendarTemplate.calculate_schedule(2026, 1)
print("1월 2026 일정:")
print(f"  예산집행일 (둘째주/넷째주 화요일): {schedule['execution_days']}")
print(f"  결재일 (전주 금요일/토요일): {schedule['approval_days']}")
print(f"  운영위원회의: {schedule['committee_day']}")

# Verify dates
print("\n날짜 확인:")
for day in schedule['execution_days']:
    weekday_kr = ['월', '화', '수', '목', '금', '토', '일'][calendar.weekday(2026, 1, day)]
    print(f"  {day}일 = {weekday_kr}요일 (집행일)")

for day in schedule['approval_days']:
    weekday_kr = ['월', '화', '수', '목', '금', '토', '일'][calendar.weekday(2026, 1, day)]
    print(f"  {day}일 = {weekday_kr}요일 (결재일)")

print("\n" + "="*50)
print(calendar.month(2026, 1))
