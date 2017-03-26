import { PointDetailedContract  } from "./point-detailed.model"
import { PointTypeEnum } from './point-type.enum'
import { PointStatusEnum } from './point-status.enum'
import { PointHistoryContract } from './point-history.model'

export class PointDetailedHistoriesContract extends PointDetailedContract {
    public PointDetailedContract(){        
        this.Histories = [];
    }

    public Histories : PointHistoryContract[];
}