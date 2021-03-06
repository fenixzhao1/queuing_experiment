import math
from ._builtin import Page, WaitPage

from datetime import timedelta
from operator import concat
from functools import reduce
from .models import parse_config

class Introduction(Page):

    def is_displayed(self):
        return self.round_number == 1


class DecisionWaitPage(WaitPage):

    body_text = 'Waiting for all players to be ready'
    wait_for_all_groups = True
    after_all_players_arrive = 'set_initial_positions'

    def is_displayed(self):
        return self.subsession.config is not None


class Decision(Page):

    def is_displayed(self):
        return self.subsession.config is not None


class ResultsWaitPage(WaitPage):
    wait_for_all_groups = True

    after_all_players_arrive = 'set_payoffs'

    def is_displayed(self):
        return self.subsession.config is not None


class Results(Page):

    timeout_seconds = 45

    def is_displayed(self):
        return self.subsession.config is not None

    def vars_for_template(self):
        period_start = self.group.get_start_time()
        period_end = self.group.get_end_time()
        if None in (period_start, period_end):
            # I really don't like having to repeat these keys twice but I can't think of any clean way to avoid it
            return {
                
            }
        events = list(self.group.events.filter(channel='swap'))
        transactions = []
        for event in events:
            if event.value['type'] == 'accept' and event.value['channel'] == 'incoming':
                if self.player.id_in_group == event.value['senderID']:
                    transactions.append({
                        'original_position': event.value['senderPosition'] + 1,
                        'new_position': event.value['receiverPosition'] + 1,
                        'transfer': event.value['offer'],
                    })
                elif self.player.id_in_group == event.value['receiverID']:
                    transactions.append({
                        'original_position': event.value['receiverPosition'] + 1,
                        'new_position': event.value['senderPosition'] + 1,
                        'transfer': -1 * event.value['offer'],
                    })
            if event.value['type'] == 'reject' and event.value['channel'] == 'incoming':
                if self.player.id_in_group == event.value['senderID']:
                    transactions.append({
                        'original_position': event.value['senderPosition'] + 1,
                        'new_position': event.value['senderPosition'] + 1,
                        'transfer': "REJECTED",
                    })
                elif self.player.id_in_group == event.value['receiverID']:
                    transactions.append({
                        'original_position': event.value['receiverPosition'] + 1,
                        'new_position': event.value['receiverPosition'] + 1,
                        'transfer': "REJECTED",
                    })

        return {
            'final_position': self.player.final_position() + 1,
            'initial_position': self.player.initial_position() + 1,
            'transactions': transactions,
        }

class Payment(Page):

    def is_displayed(self):
        return self.round_number == self.subsession.num_rounds()
    
    def vars_for_template(self):
        return {
            'payoff': self.player.in_round(self.session.vars['payment_round1']).payoff + self.player.in_round(self.session.vars['payment_round2']).payoff,
            'payoff_round1': self.session.vars['payment_round1'],
            'payoff_round2': self.session.vars['payment_round2'],
        }

page_sequence = [
    Introduction,
    DecisionWaitPage,
    Decision,
    ResultsWaitPage,
    Results,
    Payment
]