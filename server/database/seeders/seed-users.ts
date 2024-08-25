import { User } from '../models/user.model';

const users = [
    {
        username: 'paulatreides',
        email: 'paul.atreides@arrakis.com',
        password: 'muadib2024',
    },
    {
        username: 'ladyjessica',
        email: 'lady.jessica@arrakis.com',
        password: 'benegesserit2024',
    },
    {
        username: 'dukeleto',
        email: 'duke.leto@atreides.com',
        password: 'caladan2024',
    },
    {
        username: 'duncanidaho',
        email: 'duncan.idaho@atreides.com',
        password: 'swordmaster2024',
    },
    {
        username: 'gurneyhalleck',
        email: 'gurney.halleck@atreides.com',
        password: 'baliset2024',
    },
    {
        username: 'stilgar',
        email: 'stilgar@fremen.com',
        password: 'sietch2024',
    },
    {
        username: 'chani',
        email: 'chani@fremen.com',
        password: 'desertrose2024',
    },
    {
        username: 'baronharkonnen',
        email: 'baron.harkonnen@harkonnen.com',
        password: 'giedi2024',
    },
    {
        username: 'feydrautha',
        email: 'feyd.rautha@harkonnen.com',
        password: 'gladiator2024',
    },
    {
        username: 'thufirhawat',
        email: 'thufir.hawat@atreides.com',
        password: 'mentat2024',
    },
];

export const seedUsers = async () => {
    await User.bulkCreate(users);
};
