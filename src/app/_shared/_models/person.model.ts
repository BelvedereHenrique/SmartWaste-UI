import { PersonTypeEnum } from "./person-type.enum"

export class PersonModel
{
    public ID : string;
    public Name : string;
    public UserID : string;
    public CompanyID : string;
    public PersonType : PersonTypeEnum; 
    public Email : string;
}

