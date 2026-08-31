import * as Contacts from 'expo-contacts';

export const isContact = async (phoneNumber: string): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      
      // Simple exact match logic for stub, would need proper parsing in prod
      return data.some(contact => 
        contact.phoneNumbers?.some(p => p.number?.includes(phoneNumber))
      );
    }
    return false;
  } catch (error) {
    console.error('Failed to read contacts', error);
    return false;
  }
};
