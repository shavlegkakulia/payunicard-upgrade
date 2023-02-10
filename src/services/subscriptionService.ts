import { Subject } from 'rxjs';

const subject = new Subject<sub_type | undefined>();

export const subscriptionService = {
    sendData: (key: string, data: any) => subject.next({ key, data }),
    clearData: () => subject.next(undefined),
    getData: () => subject.asObservable()
};

interface sub_type {
    key: string,
    data: any
}