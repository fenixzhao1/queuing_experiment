from otree.api import (
    models, BaseConstants, BaseSubsession, BasePlayer
)

from django.contrib.contenttypes.models import ContentType
from otree_redwood.models import Event, DecisionGroup
from otree_redwood.models import Group as RedwoodGroup

import csv
import random
import math
import otree.common

doc = """
This is a Lines Queueing project
"""

class Constants(BaseConstants):
    name_in_url = 'queuing_experiment'
    players_per_group = None
    num_rounds = 50
    base_points = 0


def parse_config(config_file):
    with open('queuing_experiment/configs/' + config_file) as f:
        rows = list(csv.DictReader(f))

    rounds = []
    for row in rows:
        rounds.append({
            'round_number': int(row['round_number']),
            'num_period': int(row['num_period']),
            'group_id': int(row['group_id']),
            'duration': int(row['duration']),
            'shuffle_role': True if row['shuffle_role'] == 'TRUE' else False,
            'players_per_group': int(row['players_per_group']),
            'swap_method': str(row['swap_method']),
            'pay_method': str(row['pay_method']),
            'discrete': True if row['discrete'] == 'TRUE' else False,
            'messaging': True if row['messaging'] == 'TRUE' else False,
            'pay_rate': int(row['pay_rate']),
            'endowment': int(row['endowment']),
            'service_time': int(row['service_time']),
        })
    return rounds

class Subsession(BaseSubsession):
    def num_rounds(self):
        return len(parse_config(self.session.config['config_file']))

    def creating_session(self):
        config = self.config
        if not config:
            return

        num_silos = self.session.config['num_silos']
        fixed_id_in_group = not config['shuffle_role']

        players = self.get_players()
        num_players = len(players)
        silos = [[] for _ in range(num_silos)]
        for i, player in enumerate(players):
            if self.round_number == 1:
                player.silo_num = math.floor(num_silos * i/num_players)
            else:
                player.silo_num = player.in_round(1).silo_num
            silos[player.silo_num].append(player)
        group_matrix = []
        for silo in silos:
            silo_matrix = []
            ppg = self.config['players_per_group']
            for i in range(0, len(silo), ppg):
                silo_matrix.append(silo[i:i+ppg])
            group_matrix.extend(otree.common._group_randomly(silo_matrix, fixed_id_in_group))
        self.set_group_matrix(group_matrix)

    def set_initial_positions(self):
        for g in self.get_groups():
            players = g.get_players()
            positions = [1, 2, 3, 4, 5, 6]
            random.shuffle(positions)
            for i in range(len(positions)):
                players[i]._initial_position = positions[i]
                players[i]._initial_decision = 0
            print(positions)
    
    def set_initial_decisions(self):
        for player in self.get_players():
            player._initial_decision = 0
                
    @property
    def config(self):
        try:
            return parse_config(self.session.config['config_file'])[self.round_number-1]
        except IndexError:
            return None

class Group(DecisionGroup):

    def num_subperiods(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['num_period']

    def period_length(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['duration']
    
    def swap_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['swap_method']
    
    def pay_method(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['pay_method']

    def endowment(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['endowment']
    
    def service_time(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['service_time']
    
    def messaging(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['messaging']
    
    def discrete(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['discrete']
    
    # returns a list of the queue where index is position and value is player id
    def queue_list(self):
        queue_list = [0, 0, 0, 0, 0, 0]
        for p in self.get_players():
            queue_list[p._initial_position - 1] =  p.id_in_group
        print("queue_list: ", queue_list)
        return queue_list

    def set_payoffs(self):
        for p in self.get_players():
            p.set_payoff()

    def _on_swap_event(self, event=None, **kwargs):
        duration = self.period_length()
        swap_event = event.value['swap_event']
        # updates states of all players involved in the most recent event that triggered this
        # method call
        if swap_event == 'request':
            pass
        elif swap_event == 'accept':
            pass
        elif swap_event == 'decline':
            pass
        elif swap_event == 'cancel':
            pass

        # broadcast the updated data out to all subjects
        self.send('swap', event.value)
        # cache state of queue so that client pages will not reset on reload
        self.cache = event.value
        # manually save all updated fields to db. otree redwood thing
        self.save()



class Player(BasePlayer):
    silo_num = models.IntegerField()
    _initial_position = models.IntegerField()
    _initial_decision = models.IntegerField()

    def initial_position(self):
        return self._initial_position
    
    def initial_decision(self):
        return self._initial_decision

    def num_players(self):
        return parse_config(self.session.config['config_file'])[self.round_number-1]['players_per_group']

    def set_payoff(self):
        self.payoff = 0
