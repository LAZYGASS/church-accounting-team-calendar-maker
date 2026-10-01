"""기존 python-pptx 의존성이 있는 환경에서 실제 생성 표를 확인한다."""
import calendar
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ppt_template_generator import BudgetCalendarTemplate


class CalendarTableTests(unittest.TestCase):
    def test_generated_dates_match_weekday_headers(self):
        template = BudgetCalendarTemplate()
        for month in range(1, 13):
            template.create_calendar_slide(2026, month)
            slide = template.prs.slides[-1]
            table = next(shape.table for shape in slide.shapes if shape.has_table)
            expected_weeks = calendar.Calendar(calendar.SUNDAY).monthdayscalendar(2026, month)
            self.assertEqual([cell.text for cell in table.rows[0].cells],
                             ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
            for row_index, week in enumerate(expected_weeks, start=1):
                for column_index, day in enumerate(week):
                    if day:
                        self.assertEqual(table.cell(row_index, column_index).text.splitlines()[0], str(day))
            committee_day = template.calculate_schedule(2026, month)['committee_day']
            committee_cells = [cell.text for row in table.rows for cell in row.cells if '운영위원회' in cell.text]
            self.assertEqual(committee_cells, [f'{committee_day}\n운영위원회'])
        self.assertEqual(len(template.prs.slides), 12)


if __name__ == '__main__':
    unittest.main()
