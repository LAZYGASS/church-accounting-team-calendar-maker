import calendar

# Check January 2026 calendar structure
cal = calendar.monthcalendar(2026, 1)
print("January 2026 calendar structure:")
print("Week index | Mon Tue Wed Thu Fri Sat Sun")
print("-" * 45)
for idx, week in enumerate(cal):
    print(f"Week {idx}     | {week}")

print("\nWeekday indices:")
print("Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5, Sunday=6")

print("\nFinding Thursdays:")
for idx, week in enumerate(cal):
    thursday = week[3]  # Thursday is index 3
    if thursday != 0:
        print(f"Week {idx}: Thursday = {thursday}")
