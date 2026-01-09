
export interface PXLItem {
    id: string;
    title: string;
    hypothesis: string;
    // PXL Variables
    isAboveFold: boolean;       // 1 point
    isNoticeableIn5Sec: boolean; // 2 points
    addsOrRemoves: boolean;      // 2 points
    highTraffic: boolean;        // 1 point
    addressedIssue: boolean;     // 1 point (Simulated "Data Support")
    easeOfImplementation: 'Easy' | 'Medium' | 'Hard'; // Easy=3, Medium=1, Hard=0
    
    // Calculated
    score: number;
}

export const calculatePXLScore = (item: Omit<PXLItem, 'score'>): number => {
    let score = 0;
    if (item.isAboveFold) score += 1;
    if (item.isNoticeableIn5Sec) score += 2;
    if (item.addsOrRemoves) score += 2;
    if (item.highTraffic) score += 1;
    if (item.addressedIssue) score += 1;
    
    // Ease logic
    if (item.easeOfImplementation === 'Easy') score += 3;
    else if (item.easeOfImplementation === 'Medium') score += 1;
    else score += 0;

    return score;
};

export const PXL_CRITERIA_DESCRIPTION = `
1. **Above the Fold?** (1 pt): Will 100% of users see this change immediately?
2. **Noticeable in < 5s?** (2 pts): Is the change obvious within 5 seconds?
3. **Adds or Removes?** (2 pts): Does it fundamentally change the layout (add/remove) vs just text edit?
4. **High Traffic?** (1 pt): Is this on a high-volume page (Homepage/Landing)?
5. **Addressed Issue?** (1 pt): Does it fix a specific heuristic flaw identified?
6. **Ease?** (Easy=3, Med=1, Hard=0): Dev effort required.
`;
