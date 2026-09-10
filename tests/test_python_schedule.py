"""PPT 의존성 없이 실제 일정 계산 메서드를 실행하는 회귀 검증."""
import ast
import calendar
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
import unittest


# PPT 생성 라이브러리의 설치 여부와 무관하게 날짜 계산을 검증한다.
source = ast.parse(Path('ppt_template_generator.py').read_text(encoding='utf-8'))
template_class = next(node for node in source.body if isinstance(node, ast.ClassDef))
schedule_method = next(node for node in template_class.body
                       if isinstance(node, ast.FunctionDef) and node.name == 'calculate_schedule')
schedule_method.decorator_list = []
namespace = {'calendar': calendar, 'datetime': datetime, 'timedelta': timedelta}
rule_method = next(node for node in template_class.body
                   if isinstance(node, ast.FunctionDef) and node.name == 'uses_saturday_rule')
rule_method.decorator_list = []
exec(compile(ast.Module(body=[rule_method], type_ignores=[]), '<rule>', 'exec'), namespace)
namespace['BudgetCalendarTemplate'] = SimpleNamespace(uses_saturday_rule=namespace['uses_saturday_rule'])
exec(compile(ast.Module(body=[schedule_method], type_ignores=[]), '<schedule>', 'exec'), namespace)


class ScheduleTests(unittest.TestCase):
    def test_rules_across_years_and_week_starts(self):
        original_week_start = calendar.firstweekday()
        try:
            for week_start in (calendar.MONDAY, calendar.SUNDAY):
                calendar.setfirstweekday(week_start)
                for year in range(2000, 2101):
                    for month in range(1, 13):
                        schedule = namespace['calculate_schedule'](year, month)
                        dates = range(1, calendar.monthrange(year, month)[1] + 1)
                        saturday_rule = year > 2026 or (year == 2026 and month >= 6)
                        tuesdays = [day for day in dates if datetime(year, month, day).weekday() == (5 if saturday_rule else 1)]
                        sundays = [day for day in dates if datetime(year, month, day).weekday() == 6]
                        self.assertEqual(schedule['execution_days'], [tuesdays[1], tuesdays[3]])
                        friday_offset, saturday_offset = (8, 7) if saturday_rule else (4, 3)
                        self.assertEqual(schedule['approval_days'], [day for day in [tuesdays[1]-friday_offset, tuesdays[1]-saturday_offset, tuesdays[3]-friday_offset, tuesdays[3]-saturday_offset] if day > 0])
                        self.assertEqual(schedule['committee_day'], sundays[-1] if year == 2026 and month in (3, 4) else sundays[-2])
        finally:
            calendar.setfirstweekday(original_week_start)


if __name__ == '__main__':
    unittest.main()
