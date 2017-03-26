    import { PersonModel } from './person.model'
    import { PointStatusEnum } from './point-status.enum'

    export class PointHistoryContract
    {
        public PointHistoryContract()
        {
            this.Person = new PersonModel();
        }

        public ID : string;
        public Date : Date;
        public Status : PointStatusEnum;
        public Person : PersonModel;
        public Reason : string;
        public PointID : string;
    }