package projects.vendex.providers;

import projects.vendex.dtos.RosterDecisionDto;
import projects.vendex.dtos.RosterInputDto;

public interface RosterDecisionProvider {
    RosterDecisionDto generate(RosterInputDto input);
}
